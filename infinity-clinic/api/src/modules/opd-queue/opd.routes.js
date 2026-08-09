import { Router } from 'express';
import { query, withTransaction } from '../../config/db.js';
import { redis } from '../../config/redis.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { publishQueueUpdate } from '../../realtime/queueChannel.js';
import { APPOINTMENT_CHECK_IN_ALLOWED } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('receptionist', 'admin'));

router.get('/today', requirePermission('opd.view_today', 'appointments.view'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT a.*, p.full_name AS patient_name, p.phone AS patient_phone,
              d.full_name AS doctor_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.appointment_date = CURRENT_DATE
       ORDER BY a.appointment_time`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/queue/:doctorId', requirePermission('opd.view_queue'), async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { rows } = await query(
      `SELECT t.*, p.id AS patient_id, p.full_name AS patient_name, a.appointment_time
       FROM opd_tokens t
       JOIN appointments a ON a.id = t.appointment_id
       JOIN patients p ON p.id = a.patient_id
       WHERE t.doctor_id = $1 AND t.visit_date = CURRENT_DATE
       ORDER BY t.token_number`,
      [doctorId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/:appointmentId/check-in', requirePermission('appointments.check_in'), async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const result = await withTransaction(async (client) => {
      const { rows: appts } = await client.query(
        `SELECT * FROM appointments WHERE id = $1 FOR UPDATE`,
        [appointmentId]
      );
      const appt = appts[0];
      if (!appt) throw new AppError('Appointment not found', 404, 'NOT_FOUND');
      if (!APPOINTMENT_CHECK_IN_ALLOWED.includes(appt.status)) {
        throw new AppError('Appointment cannot be checked in', 400, 'INVALID_STATUS');
      }

      const { rows: counters } = await client.query(
        `INSERT INTO opd_token_counters (doctor_id, visit_date, last_token)
         VALUES ($1, $2, 1)
         ON CONFLICT (doctor_id, visit_date)
         DO UPDATE SET last_token = opd_token_counters.last_token + 1
         RETURNING last_token`,
        [appt.doctor_id, appt.appointment_date]
      );
      const tokenNumber = counters[0].last_token;

      const { rows: tokens } = await client.query(
        `INSERT INTO opd_tokens (appointment_id, doctor_id, visit_date, token_number)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [appointmentId, appt.doctor_id, appt.appointment_date, tokenNumber]
      );

      await client.query(
        `UPDATE appointments SET status = 'checked_in', updated_at = NOW() WHERE id = $1`,
        [appointmentId]
      );

      return { token: tokens[0], doctorId: appt.doctor_id };
    });

    await publishQueueUpdate(redis, result.doctorId, {
      type: 'check_in',
      token: result.token,
    });

    res.status(201).json(result.token);
  } catch (err) {
    next(err);
  }
});

export default router;
