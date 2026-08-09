import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { query, withTransaction } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';
import { doctorInput, doctorScheduleInput } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

const doctorSchema = doctorInput;
const scheduleSchema = doctorScheduleInput;

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT d.*, u.email, u.is_active AS user_active
       FROM doctors d JOIN users u ON u.id = d.user_id
       ORDER BY d.full_name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT d.*, u.email FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Doctor not found', 404, 'NOT_FOUND');

    const { rows: schedules } = await query(
      `SELECT * FROM doctor_schedules WHERE doctor_id = $1 AND is_active = true ORDER BY day_of_week, start_time`,
      [req.params.id]
    );
    res.json({ ...rows[0], schedules });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = doctorSchema.parse(req.body);
    if (!data.password) throw new AppError('Password required for new doctor', 400, 'VALIDATION_ERROR');

    const result = await withTransaction(async (client) => {
      const hash = await bcrypt.hash(data.password, 12);
      const { rows: users } = await client.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'doctor') RETURNING id`,
        [data.email.toLowerCase(), hash]
      );
      const { rows: doctors } = await client.query(
        `INSERT INTO doctors (user_id, full_name, specialization, qualification, bio, photo_url, consultation_fee)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [users[0].id, data.fullName, data.specialization || null, data.qualification || null,
         data.bio || null, data.photoUrl || null, data.consultationFee || 0]
      );
      return doctors[0];
    });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    if (err.code === '23505') return next(new AppError('Email already exists', 409, 'DUPLICATE'));
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = doctorSchema.partial().parse(req.body);
    const { rows: existing } = await query('SELECT user_id FROM doctors WHERE id = $1', [req.params.id]);
    if (!existing[0]) throw new AppError('Doctor not found', 404, 'NOT_FOUND');

    if (data.email) {
      await query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [data.email.toLowerCase(), existing[0].user_id]);
    }
    if (data.password) {
      const hash = await bcrypt.hash(data.password, 12);
      await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, existing[0].user_id]);
    }

    const { rows } = await query(
      `UPDATE doctors SET
        full_name = COALESCE($1, full_name), specialization = COALESCE($2, specialization),
        qualification = COALESCE($3, qualification), bio = COALESCE($4, bio),
        photo_url = COALESCE($5, photo_url), consultation_fee = COALESCE($6, consultation_fee),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [data.fullName, data.specialization, data.qualification, data.bio, data.photoUrl, data.consultationFee, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.patch('/:id/deactivate', async (req, res, next) => {
  try {
    const { rows: doc } = await query('SELECT user_id FROM doctors WHERE id = $1', [req.params.id]);
    if (!doc[0]) throw new AppError('Doctor not found', 404, 'NOT_FOUND');
    await query('UPDATE doctors SET is_active = false, updated_at = NOW() WHERE id = $1', [req.params.id]);
    await query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [doc[0].user_id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/schedules', async (req, res, next) => {
  try {
    const data = scheduleSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, data.dayOfWeek, data.startTime, data.endTime, data.slotDurationMinutes || 15]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    if (err.code === '23505') return next(new AppError('Schedule conflict', 409, 'DUPLICATE'));
    next(err);
  }
});

router.delete('/:id/schedules/:scheduleId', async (req, res, next) => {
  try {
    await query(
      `UPDATE doctor_schedules SET is_active = false WHERE id = $1 AND doctor_id = $2`,
      [req.params.scheduleId, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
