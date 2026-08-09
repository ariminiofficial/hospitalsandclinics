import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordPaymentInput } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('receptionist', 'admin'));

router.post('/:appointmentId/record-offline', requirePermission('payments.record'), async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const data = recordPaymentInput.parse(req.body);

    const { rows: appts } = await query('SELECT id FROM appointments WHERE id = $1', [appointmentId]);
    if (appts.length === 0) throw new AppError('Appointment not found', 404, 'NOT_FOUND');

    const { rows } = await query(
      `INSERT INTO payments (appointment_id, amount, method, status, recorded_by, paid_at)
       VALUES ($1, $2, $3, 'completed', $4, NOW())
       ON CONFLICT (appointment_id) DO UPDATE
       SET amount = $2, method = $3, status = 'completed', recorded_by = $4, paid_at = NOW()
       RETURNING *`,
      [appointmentId, data.amount, data.method, req.user.id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.get('/:appointmentId/receipt', requirePermission('payments.receipt'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT pay.*, a.appointment_date, a.appointment_time,
              p.full_name AS patient_name, p.phone AS patient_phone,
              d.full_name AS doctor_name,
              u.email AS recorded_by_email,
              cs.value AS clinic_name
       FROM payments pay
       JOIN appointments a ON a.id = pay.appointment_id
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN users u ON u.id = pay.recorded_by
       LEFT JOIN clinic_settings cs ON cs.key = 'clinic_name'
       WHERE pay.appointment_id = $1`,
      [req.params.appointmentId]
    );
    if (!rows[0]) throw new AppError('Payment not found', 404, 'NOT_FOUND');

    const { rows: contact } = await query(
      `SELECT content FROM website_content WHERE section_key = 'contact'`
    );

    res.json({
      ...rows[0],
      clinic_name: rows[0].clinic_name || 'Infinity Clinic',
      contact: contact[0]?.content || {},
    });
  } catch (err) {
    next(err);
  }
});

export default router;
