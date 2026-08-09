import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { patientInput } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('receptionist', 'admin', 'doctor'));

router.get('/search', requirePermission('patients.search'), async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }
    const { rows } = await query(
      `SELECT id, phone, full_name, email, date_of_birth, gender, address, created_at
       FROM patients
       WHERE phone ILIKE $1 OR full_name ILIKE $1
       ORDER BY full_name LIMIT 20`,
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requirePermission('patients.view'), async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (!rows[0]) throw new AppError('Patient not found', 404, 'NOT_FOUND');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/history', requirePermission('patients.history'), async (req, res, next) => {
  try {
    const mineOnly = req.query.mine === '1' || req.query.mine === 'true';
    const doctorId = mineOnly ? req.user.doctorId : null;
    if (mineOnly && !doctorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Doctor profile not found' });
    }
    const targetDoctorId = mineOnly ? (req.query.doctorId || doctorId) : null;

    const { rows } = await query(
      `SELECT a.id, a.id AS appointment_id, a.appointment_date, a.appointment_time, a.status,
              a.notes AS appointment_notes, a.booked_via,
              d.id AS doctor_id, d.full_name AS doctor_name,
              c.id AS consultation_id, c.chief_complaint, c.diagnosis, c.notes AS consultation_notes,
              pay.amount AS payment_amount, pay.method AS payment_method,
              pr.id AS prescription_id, pr.advice AS prescription_advice,
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
                 FROM prescription_items pi WHERE pi.prescription_id = pr.id),
                '[]'::json
              ) AS prescription_items
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN consultations c ON c.appointment_id = a.id
       LEFT JOIN prescriptions pr ON pr.consultation_id = c.id
       LEFT JOIN payments pay ON pay.appointment_id = a.id
       WHERE a.patient_id = $1
         AND ($2::uuid IS NULL OR a.doctor_id = $2)
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT 50`,
      [req.params.id, targetDoctorId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authorize('receptionist', 'admin'), requirePermission('patients.create'), async (req, res, next) => {
  try {
    const data = patientInput.parse(req.body);
    const { rows } = await query(
      `INSERT INTO patients (phone, full_name, email, date_of_birth, gender, address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.phone, data.fullName, data.email || null, data.dateOfBirth || null, data.gender || null, data.address || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    if (err.code === '23505') return next(new AppError('Phone number already exists', 409, 'DUPLICATE'));
    next(err);
  }
});

router.put('/:id', authorize('receptionist', 'admin'), requirePermission('patients.edit'), async (req, res, next) => {
  try {
    const data = patientInput.parse(req.body);
    const { rows } = await query(
      `UPDATE patients SET phone = $1, full_name = $2, email = $3, date_of_birth = $4,
       gender = $5, address = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
      [data.phone, data.fullName, data.email || null, data.dateOfBirth || null, data.gender || null, data.address || null, req.params.id]
    );
    if (!rows[0]) throw new AppError('Patient not found', 404, 'NOT_FOUND');
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

export default router;
