import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { query, withTransaction } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';
import { receptionistInput } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

const receptionistSchema = receptionistInput;

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT r.*, u.email, u.is_active AS user_active
       FROM receptionists r JOIN users u ON u.id = r.user_id
       ORDER BY r.full_name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = receptionistSchema.parse(req.body);
    if (!data.password) throw new AppError('Password required', 400, 'VALIDATION_ERROR');

    const result = await withTransaction(async (client) => {
      const hash = await bcrypt.hash(data.password, 12);
      const { rows: users } = await client.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'receptionist') RETURNING id`,
        [data.email.toLowerCase(), hash]
      );
      const { rows: recs } = await client.query(
        `INSERT INTO receptionists (user_id, full_name) VALUES ($1, $2) RETURNING *`,
        [users[0].id, data.fullName]
      );
      return recs[0];
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
    const data = receptionistSchema.partial().parse(req.body);
    const { rows: existing } = await query('SELECT user_id FROM receptionists WHERE id = $1', [req.params.id]);
    if (!existing[0]) throw new AppError('Receptionist not found', 404, 'NOT_FOUND');

    if (data.email) {
      await query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [data.email.toLowerCase(), existing[0].user_id]);
    }
    if (data.password) {
      const hash = await bcrypt.hash(data.password, 12);
      await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, existing[0].user_id]);
    }
    if (data.fullName) {
      await query('UPDATE receptionists SET full_name = $1, updated_at = NOW() WHERE id = $2', [data.fullName, req.params.id]);
    }
    const { rows } = await query('SELECT * FROM receptionists WHERE id = $1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.patch('/:id/deactivate', async (req, res, next) => {
  try {
    const { rows: rec } = await query('SELECT user_id FROM receptionists WHERE id = $1', [req.params.id]);
    if (!rec[0]) throw new AppError('Receptionist not found', 404, 'NOT_FOUND');
    await query('UPDATE receptionists SET is_active = false, updated_at = NOW() WHERE id = $1', [req.params.id]);
    await query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [rec[0].user_id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
