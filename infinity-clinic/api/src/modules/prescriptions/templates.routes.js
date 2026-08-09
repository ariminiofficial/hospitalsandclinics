import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { medicineTemplateInput } from '../../schema/index.js';
import { templateRowToApi } from './templates.service.js';

const router = Router();

router.use(authenticate);
router.use(authorize('doctor', 'admin'));

function resolveDoctorId(req) {
  if (req.user.role === 'admin' && req.query.doctorId) return req.query.doctorId;
  if (!req.user.doctorId) throw new AppError('Doctor profile not found', 403, 'FORBIDDEN');
  return req.user.doctorId;
}

router.get('/', requirePermission('prescriptions.write'), async (req, res, next) => {
  try {
    const doctorId = resolveDoctorId(req);
    const q = (req.query.q || '').trim();
    const params = [doctorId];
    let searchSql = '';
    if (q) {
      params.push(`%${q}%`);
      searchSql = `AND medicine_name ILIKE $2`;
    }
    const { rows } = await query(
      `SELECT * FROM medicine_templates
       WHERE doctor_id = $1 ${searchSql}
       ORDER BY last_used_at DESC
       LIMIT 50`,
      params
    );
    res.json(rows.map(templateRowToApi));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requirePermission('prescriptions.write'), async (req, res, next) => {
  try {
    const doctorId = resolveDoctorId(req);
    const { rowCount } = await query(
      'DELETE FROM medicine_templates WHERE id = $1 AND doctor_id = $2',
      [req.params.id, doctorId]
    );
    if (!rowCount) throw new AppError('Template not found', 404, 'NOT_FOUND');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('prescriptions.write'), async (req, res, next) => {
  try {
    const data = medicineTemplateInput.parse(req.body);
    const doctorId = resolveDoctorId(req);
    const timing = data.timing || {};
    const { rows } = await query(
      `INSERT INTO medicine_templates (
         doctor_id, medicine_name, dose, times_per_day,
         timing_morning, timing_afternoon, timing_evening, timing_night,
         duration, instructions
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (doctor_id, medicine_name) DO UPDATE SET
         dose = EXCLUDED.dose,
         times_per_day = EXCLUDED.times_per_day,
         timing_morning = EXCLUDED.timing_morning,
         timing_afternoon = EXCLUDED.timing_afternoon,
         timing_evening = EXCLUDED.timing_evening,
         timing_night = EXCLUDED.timing_night,
         duration = EXCLUDED.duration,
         instructions = EXCLUDED.instructions,
         use_count = medicine_templates.use_count + 1,
         last_used_at = NOW()
       RETURNING *`,
      [
        doctorId,
        data.medicineName.trim(),
        data.dose || null,
        data.timesPerDay ? Number(data.timesPerDay) : null,
        Boolean(timing.morning),
        Boolean(timing.afternoon),
        Boolean(timing.evening),
        Boolean(timing.night),
        data.duration || null,
        data.instructions || null,
      ]
    );
    res.status(201).json(templateRowToApi(rows[0]));
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

export default router;
