import { Router } from 'express';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { publishPharmacyUpdate } from '../../realtime/pharmacyChannel.js';
import { redis } from '../../config/redis.js';

const router = Router();

const PRESCRIPTION_SELECT = `
  SELECT p.id, p.pharmacy_status, p.advice, p.created_at, p.dispensed_at,
         pat.id AS patient_id, pat.full_name AS patient_name, pat.phone AS patient_phone,
         pat.date_of_birth, pat.gender,
         d.full_name AS doctor_name, d.specialization,
         a.appointment_date, a.appointment_time,
         ot.token_number,
         COALESCE(
           (SELECT json_agg(
              json_build_object(
                'id', pi.id,
                'medicine_name', pi.medicine_name,
                'dose', pi.dose,
                'dosage', pi.dosage,
                'times_per_day', pi.times_per_day,
                'timing_morning', pi.timing_morning,
                'timing_afternoon', pi.timing_afternoon,
                'timing_evening', pi.timing_evening,
                'timing_night', pi.timing_night,
                'frequency', pi.frequency,
                'duration', pi.duration,
                'instructions', pi.instructions,
                'sort_order', pi.sort_order
              ) ORDER BY pi.sort_order
            )
            FROM prescription_items pi WHERE pi.prescription_id = p.id),
           '[]'::json
         ) AS items
  FROM prescriptions p
  JOIN patients pat ON pat.id = p.patient_id
  JOIN doctors d ON d.id = p.doctor_id
  JOIN consultations c ON c.id = p.consultation_id
  JOIN appointments a ON a.id = c.appointment_id
  LEFT JOIN opd_tokens ot ON ot.appointment_id = a.id
`;

router.use(authenticate);
router.use(authorize('pharmacist', 'admin'));

router.get('/queue', requirePermission('pharmacy.view_queue'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `${PRESCRIPTION_SELECT}
       WHERE p.pharmacy_status IN ('pending', 'dispensing')
         AND a.status = 'completed'
       ORDER BY p.created_at ASC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/history', requirePermission('pharmacy.view_history'), async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 7, 30);
    const { rows } = await query(
      `${PRESCRIPTION_SELECT}
       WHERE p.pharmacy_status = 'dispensed'
         AND p.dispensed_at >= NOW() - ($1::int || ' days')::interval
       ORDER BY p.dispensed_at DESC
       LIMIT 100`,
      [days]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:prescriptionId', requirePermission('pharmacy.view_queue'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `${PRESCRIPTION_SELECT} WHERE p.id = $1`,
      [req.params.prescriptionId]
    );
    if (!rows[0]) throw new AppError('Prescription not found', 404, 'NOT_FOUND');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:prescriptionId/start', requirePermission('pharmacy.dispense'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE prescriptions SET pharmacy_status = 'dispensing'
       WHERE id = $1 AND pharmacy_status = 'pending'
       RETURNING id`,
      [req.params.prescriptionId]
    );
    if (!rows[0]) throw new AppError('Prescription not available', 404, 'NOT_FOUND');
    const { rows: full } = await query(`${PRESCRIPTION_SELECT} WHERE p.id = $1`, [req.params.prescriptionId]);
    res.json(full[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/:prescriptionId/dispense', requirePermission('pharmacy.dispense'), async (req, res, next) => {
  try {
    const pharmacistId = req.user.pharmacistId;
    if (!pharmacistId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Pharmacist profile not found' });
    }
    const { rows } = await query(
      `UPDATE prescriptions
       SET pharmacy_status = 'dispensed', dispensed_at = NOW(), dispensed_by = $2
       WHERE id = $1 AND pharmacy_status IN ('pending', 'dispensing')
       RETURNING id`,
      [req.params.prescriptionId, pharmacistId]
    );
    if (!rows[0]) throw new AppError('Prescription not available', 404, 'NOT_FOUND');
    await publishPharmacyUpdate(redis, { type: 'dispensed', prescriptionId: req.params.prescriptionId });
    const { rows: full } = await query(`${PRESCRIPTION_SELECT} WHERE p.id = $1`, [req.params.prescriptionId]);
    res.json(full[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
