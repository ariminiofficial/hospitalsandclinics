import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  walkInInput,
  rescheduleInput,
  APPOINTMENT_CHECK_IN_ALLOWED,
  APPOINTMENT_CANCEL_BLOCKED,
  APPOINTMENT_NO_SHOW_ALLOWED,
  APPOINTMENT_RESCHEDULE_BLOCKED,
} from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('receptionist', 'admin'));

router.get('/', requirePermission('appointments.view'), async (req, res, next) => {
  try {
    const { date, doctorId, status } = req.query;
    const conditions = ['1=1'];
    const params = [];
    let idx = 1;

    if (date) { conditions.push(`a.appointment_date = $${idx++}`); params.push(date); }
    if (doctorId) { conditions.push(`a.doctor_id = $${idx++}`); params.push(doctorId); }
    if (status) { conditions.push(`a.status = $${idx++}`); params.push(status); }

    const { rows } = await query(
      `SELECT a.*, p.full_name AS patient_name, p.phone AS patient_phone,
              d.full_name AS doctor_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date DESC, a.appointment_time`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/walk-in', requirePermission('appointments.walk_in'), async (req, res, next) => {
  try {
    const data = walkInInput.parse(req.body);
    let patientId = data.patientId;

    if (!patientId && data.patient) {
      const { rows: existing } = await query('SELECT id FROM patients WHERE phone = $1', [data.patient.phone]);
      if (existing.length > 0) {
        patientId = existing[0].id;
        await query(
          `UPDATE patients SET full_name = $1, updated_at = NOW() WHERE id = $2`,
          [data.patient.fullName, patientId]
        );
      } else {
        const inserted = await query(
          `INSERT INTO patients (phone, full_name, email, gender) VALUES ($1, $2, $3, $4) RETURNING id`,
          [data.patient.phone, data.patient.fullName, data.patient.email || null, data.patient.gender || null]
        );
        patientId = inserted.rows[0].id;
      }
    }

    if (!patientId) throw new AppError('Patient required', 400, 'VALIDATION_ERROR');

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const { rows } = await query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, booked_via, notes)
       VALUES ($1, $2, CURRENT_DATE, $3, 'confirmed', 'walk_in', $4) RETURNING *`,
      [patientId, data.doctorId, time, data.notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.patch('/:id/confirm', requirePermission('appointments.confirm'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE appointments SET status = 'confirmed', updated_at = NOW()
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Appointment not found or cannot be confirmed', 400, 'INVALID_STATUS');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/cancel', requirePermission('appointments.cancel'), async (req, res, next) => {
  try {
    const blocked = APPOINTMENT_CANCEL_BLOCKED.map((s) => `'${s}'`).join(', ');
    const { rows } = await query(
      `UPDATE appointments SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND status NOT IN (${blocked}) RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Appointment not found or cannot be cancelled', 400, 'INVALID_STATUS');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/no-show', requirePermission('appointments.no_show'), async (req, res, next) => {
  try {
    const allowed = APPOINTMENT_NO_SHOW_ALLOWED.map((s) => `'${s}'`).join(', ');
    const { rows } = await query(
      `UPDATE appointments SET status = 'no_show', updated_at = NOW()
       WHERE id = $1 AND status IN (${allowed}) RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Appointment not found or cannot be marked no-show', 400, 'INVALID_STATUS');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/reschedule', requirePermission('appointments.reschedule'), async (req, res, next) => {
  try {
    const data = rescheduleInput.parse(req.body);
    const blocked = APPOINTMENT_RESCHEDULE_BLOCKED.map((s) => `'${s}'`).join(', ');
    const { rows } = await query(
      `UPDATE appointments SET appointment_date = $1, appointment_time = $2, status = 'confirmed', updated_at = NOW()
       WHERE id = $3 AND status NOT IN (${blocked}) RETURNING *`,
      [data.appointmentDate, data.appointmentTime, req.params.id]
    );
    if (!rows[0]) throw new AppError('Appointment not found or cannot be rescheduled', 400, 'INVALID_STATUS');
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    if (err.code === '23505') return next(new AppError('Slot already booked', 409, 'SLOT_TAKEN'));
    next(err);
  }
});

export default router;
