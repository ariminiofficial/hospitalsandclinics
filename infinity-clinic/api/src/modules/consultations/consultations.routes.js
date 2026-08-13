import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../../config/db.js';
import { redis } from '../../config/redis.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { publishQueueUpdate } from '../../realtime/queueChannel.js';
import { publishPharmacyUpdate } from '../../realtime/pharmacyChannel.js';
import { consultationInput } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('doctor', 'admin'));

function resolveDoctorId(req) {
  if (!req.user.doctorId && req.user.role !== 'admin') {
    throw new AppError('Doctor profile not found', 403, 'FORBIDDEN');
  }
  return req.query.doctorId || req.user.doctorId || null;
}

router.get('/queue', requirePermission('consultations.view_queue'), async (req, res, next) => {
  try {
    const targetDoctorId = resolveDoctorId(req);
    if (!targetDoctorId) return res.json([]);
    const { rows } = await query(
      `SELECT t.*, p.id AS patient_id, p.full_name AS patient_name, p.phone AS patient_phone,
              p.date_of_birth, p.gender, a.appointment_time, a.id AS appointment_id
       FROM opd_tokens t
       JOIN appointments a ON a.id = t.appointment_id
       JOIN patients p ON p.id = a.patient_id
       WHERE t.doctor_id = $1 AND t.visit_date = CURRENT_DATE
       ORDER BY t.token_number`,
      [targetDoctorId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/today', requirePermission('consultations.today'), async (req, res, next) => {
  try {
    const targetDoctorId = resolveDoctorId(req);
    if (!targetDoctorId) return res.json([]);
    const { rows } = await query(
      `SELECT a.*, p.id AS patient_id, p.full_name AS patient_name, p.phone AS patient_phone
       FROM appointments a JOIN patients p ON p.id = a.patient_id
       WHERE a.doctor_id = $1 AND a.appointment_date = CURRENT_DATE
       ORDER BY a.appointment_time`,
      [targetDoctorId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/history', requirePermission('consultations.history'), async (req, res, next) => {
  try {
    const targetDoctorId = resolveDoctorId(req);
    if (!targetDoctorId) return res.json([]);
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
    const { rows } = await query(
      `SELECT c.id, c.chief_complaint, c.diagnosis, c.notes, c.created_at,
              p.id AS patient_id, p.full_name AS patient_name, p.phone AS patient_phone,
              a.appointment_date, a.appointment_time, a.status AS appointment_status
       FROM consultations c
       JOIN appointments a ON a.id = c.appointment_id
       JOIN patients p ON p.id = c.patient_id
       WHERE c.doctor_id = $1
         AND a.appointment_date >= CURRENT_DATE - $2::int
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT 100`,
      [targetDoctorId, days]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/tokens/:tokenId/call', requirePermission('consultations.call'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE opd_tokens SET status = 'called', called_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.tokenId]
    );
    if (!rows[0]) throw new AppError('Token not found', 404, 'NOT_FOUND');
    await publishQueueUpdate(redis, rows[0].doctor_id, { type: 'called', token: rows[0] });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/tokens/:tokenId/start', requirePermission('consultations.start'), async (req, res, next) => {
  try {
    const result = await withTransaction(async (client) => {
      const { rows: tokens } = await client.query(
        `UPDATE opd_tokens SET status = 'in_consultation' WHERE id = $1 RETURNING *`,
        [req.params.tokenId]
      );
      const token = tokens[0];
      if (!token) throw new AppError('Token not found', 404, 'NOT_FOUND');

      const { rows: appts } = await client.query(
        `SELECT patient_id FROM appointments WHERE id = $1`,
        [token.appointment_id]
      );

      await client.query(
        `UPDATE appointments SET status = 'in_consultation', updated_at = NOW() WHERE id = $1`,
        [token.appointment_id]
      );

      const { rows: existing } = await client.query(
        `SELECT id FROM consultations WHERE appointment_id = $1`,
        [token.appointment_id]
      );

      let consultation;
      if (existing.length > 0) {
        consultation = existing[0];
      } else {
        const { rows: created } = await client.query(
          `INSERT INTO consultations (appointment_id, doctor_id, patient_id)
           VALUES ($1, $2, $3) RETURNING *`,
          [token.appointment_id, token.doctor_id, appts[0].patient_id]
        );
        consultation = created[0];
      }

      return { token, consultation };
    });

    await publishQueueUpdate(redis, result.token.doctor_id, { type: 'in_consultation', token: result.token });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/tokens/:tokenId/skip', requirePermission('consultations.skip'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE opd_tokens SET status = 'skipped' WHERE id = $1 RETURNING *`,
      [req.params.tokenId]
    );
    if (!rows[0]) throw new AppError('Token not found', 404, 'NOT_FOUND');
    await publishQueueUpdate(redis, rows[0].doctor_id, { type: 'skipped', token: rows[0] });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:consultationId', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.*, p.full_name AS patient_name, p.phone AS patient_phone,
              p.date_of_birth, p.gender, d.full_name AS doctor_name
       FROM consultations c
       JOIN patients p ON p.id = c.patient_id
       JOIN doctors d ON d.id = c.doctor_id
       WHERE c.id = $1`,
      [req.params.consultationId]
    );
    if (!rows[0]) throw new AppError('Consultation not found', 404, 'NOT_FOUND');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:consultationId', requirePermission('consultations.notes'), async (req, res, next) => {
  try {
    const data = consultationInput.parse(req.body);
    const { rows } = await query(
      `UPDATE consultations SET
        chief_complaint = COALESCE($1, chief_complaint),
        diagnosis = COALESCE($2, diagnosis),
        notes = COALESCE($3, notes),
        updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [data.chiefComplaint, data.diagnosis, data.notes, req.params.consultationId]
    );
    if (!rows[0]) throw new AppError('Consultation not found', 404, 'NOT_FOUND');
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.post('/:consultationId/complete', requirePermission('consultations.complete'), async (req, res, next) => {
  try {
    const result = await withTransaction(async (client) => {
      const { rows: consults } = await client.query(
        `SELECT c.*, a.id AS appointment_id FROM consultations c
         JOIN appointments a ON a.id = c.appointment_id WHERE c.id = $1`,
        [req.params.consultationId]
      );
      const consult = consults[0];
      if (!consult) throw new AppError('Consultation not found', 404, 'NOT_FOUND');

      await client.query(
        `UPDATE appointments SET status = 'completed', updated_at = NOW() WHERE id = $1`,
        [consult.appointment_id]
      );

      const { rows: tokens } = await client.query(
        `UPDATE opd_tokens SET status = 'completed', completed_at = NOW()
         WHERE appointment_id = $1 RETURNING *`,
        [consult.appointment_id]
      );

      const { rows: activatedRx } = await client.query(
        `UPDATE prescriptions SET pharmacy_status = 'pending'
         WHERE consultation_id = $1 AND pharmacy_status = 'draft'
         RETURNING id`,
        [consult.id]
      );

      return { consultation: consult, token: tokens[0], pharmacyRxIds: activatedRx.map((r) => r.id) };
    });

    if (result.token) {
      await publishQueueUpdate(redis, result.token.doctor_id, { type: 'completed', token: result.token });
    }
    if (result.pharmacyRxIds?.length > 0) {
      await publishPharmacyUpdate(redis, {
        type: 'new_prescription',
        prescriptionIds: result.pharmacyRxIds,
      });
    }
    res.json(result.consultation);
  } catch (err) {
    next(err);
  }
});

export default router;
