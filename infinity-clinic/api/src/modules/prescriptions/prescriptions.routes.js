import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { prescriptionInput, prescriptionItemToDb } from '../../schema/index.js';
import { upsertMedicineTemplates } from './templates.service.js';

const router = Router();

router.use(authenticate);
router.use(authorize('doctor', 'admin'));

router.get('/consultation/:consultationId', requirePermission('prescriptions.write', 'prescriptions.print'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, d.full_name AS doctor_name, pat.full_name AS patient_name,
              pat.phone AS patient_phone, pat.date_of_birth, pat.gender
       FROM prescriptions p
       JOIN doctors d ON d.id = p.doctor_id
       JOIN patients pat ON pat.id = p.patient_id
       WHERE p.consultation_id = $1`,
      [req.params.consultationId]
    );
    if (!rows[0]) return res.json(null);

    const { rows: items } = await query(
      `SELECT * FROM prescription_items WHERE prescription_id = $1 ORDER BY sort_order`,
      [rows[0].id]
    );
    res.json({ ...rows[0], items });
  } catch (err) {
    next(err);
  }
});

router.post('/consultation/:consultationId', requirePermission('prescriptions.write'), async (req, res, next) => {
  try {
    const data = prescriptionInput.parse(req.body);
    if (!req.user.doctorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Doctor profile not found' });
    }

    const result = await withTransaction(async (client) => {
      const { rows: consults } = await client.query(
        'SELECT doctor_id, patient_id FROM consultations WHERE id = $1',
        [req.params.consultationId]
      );
      if (!consults[0]) throw new AppError('Consultation not found', 404, 'NOT_FOUND');

      const { rows: existing } = await client.query(
        'SELECT id FROM prescriptions WHERE consultation_id = $1',
        [req.params.consultationId]
      );

      let prescriptionId;
      if (existing.length > 0) {
        prescriptionId = existing[0].id;
        await client.query('UPDATE prescriptions SET advice = $1 WHERE id = $2', [data.advice || null, prescriptionId]);
        await client.query('DELETE FROM prescription_items WHERE prescription_id = $1', [prescriptionId]);
      } else {
        const { rows: created } = await client.query(
          `INSERT INTO prescriptions (consultation_id, doctor_id, patient_id, advice)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [req.params.consultationId, consults[0].doctor_id, consults[0].patient_id, data.advice || null]
        );
        prescriptionId = created[0].id;
      }

      for (let i = 0; i < data.items.length; i++) {
        const db = prescriptionItemToDb(data.items[i], prescriptionId, i);
        await client.query(
          `INSERT INTO prescription_items (
             prescription_id, medicine_name, dosage, frequency, duration, instructions,
             dose, times_per_day, timing_morning, timing_afternoon, timing_evening, timing_night, sort_order
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            prescriptionId, db.medicine_name, db.dosage, db.frequency, db.duration, db.instructions,
            db.dose, db.times_per_day, db.timing_morning, db.timing_afternoon, db.timing_evening, db.timing_night, db.sort_order,
          ]
        );
      }

      await upsertMedicineTemplates(client, consults[0].doctor_id, data.items);

      const { rows: prescription } = await client.query('SELECT * FROM prescriptions WHERE id = $1', [prescriptionId]);
      const { rows: items } = await client.query(
        'SELECT * FROM prescription_items WHERE prescription_id = $1 ORDER BY sort_order',
        [prescriptionId]
      );
      return { ...prescription[0], items };
    });

    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.get('/:id/print', requirePermission('prescriptions.print'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, d.full_name AS doctor_name, d.specialization, d.qualification,
              pat.full_name AS patient_name, pat.phone AS patient_phone,
              pat.date_of_birth, pat.gender,
              c.chief_complaint, c.diagnosis,
              cs.value AS clinic_name
       FROM prescriptions p
       JOIN doctors d ON d.id = p.doctor_id
       JOIN patients pat ON pat.id = p.patient_id
       JOIN consultations c ON c.id = p.consultation_id
       LEFT JOIN clinic_settings cs ON cs.key = 'clinic_name'
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Prescription not found', 404, 'NOT_FOUND');

    const { rows: items } = await query(
      'SELECT * FROM prescription_items WHERE prescription_id = $1 ORDER BY sort_order',
      [req.params.id]
    );

    const { rows: contact } = await query(
      `SELECT content FROM website_content WHERE section_key = 'contact'`
    );

    res.json({
      ...rows[0],
      clinic_name: rows[0].clinic_name || 'Infinity Clinic',
      contact: contact[0]?.content || {},
      items,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
