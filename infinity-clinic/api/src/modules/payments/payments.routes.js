import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissions.js';
import { AppError } from '../../middleware/errorHandler.js';
import { recordPaymentInput, auditPaymentInput } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('receptionist', 'admin'));

/**
 * 1. Record Offline Payment (with Transaction Reference, Services & Audit Log)
 */
router.post('/:appointmentId/record-offline', requirePermission('payments.record'), async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const data = recordPaymentInput.parse(req.body);

    const { rows: appts } = await query('SELECT id, patient_id, doctor_id FROM appointments WHERE id = $1', [appointmentId]);
    if (appts.length === 0) throw new AppError('Appointment not found', 404, 'NOT_FOUND');

    if (Array.isArray(data.services)) {
      await query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [appointmentId]);
      for (const s of data.services) {
        if (s.serviceName?.trim()) {
          await query(
            `INSERT INTO appointment_services (appointment_id, service_id, service_name, price, quantity, notes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [appointmentId, s.serviceId || null, s.serviceName, s.price ?? 0, s.quantity || 1, s.notes || null]
          );
        }
      }
    }

    const { rows } = await query(
      `INSERT INTO payments (appointment_id, amount, method, transaction_ref, notes, status, audit_status, recorded_by, paid_at)
       VALUES ($1, $2, $3, $4, $5, 'completed', 'pending_audit', $6, NOW())
       ON CONFLICT (appointment_id) DO UPDATE
       SET amount = $2, method = $3, transaction_ref = $4, notes = $5, status = 'completed', recorded_by = $6, paid_at = NOW()
       RETURNING *`,
      [appointmentId, data.amount, data.method, data.transactionRef || null, data.notes || null, req.user.id]
    );

    const payment = rows[0];

    // Create immutable audit log entry
    await query(
      `INSERT INTO payment_audit_logs (payment_id, appointment_id, action, performed_by, new_values, notes)
       VALUES ($1, $2, 'RECORDED', $3, $4, $5)`,
      [
        payment.id,
        appointmentId,
        req.user.id,
        JSON.stringify({
          amount: data.amount,
          method: data.method,
          transaction_ref: data.transactionRef || null,
          services: data.services || [],
        }),
        data.notes || 'Offline payment recorded at reception desk',
      ]
    );

    res.status(201).json(payment);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

/**
 * 2. Payment Auditing Summary & Reconciled Metrics
 */
router.get('/audit/summary', requirePermission('payments.audit'), async (req, res, next) => {
  try {
    const { from, to, preset } = req.query;

    let dateCondition = '';
    const params = [];

    if (preset === 'today') {
      dateCondition = 'WHERE pay.paid_at::date = CURRENT_DATE';
    } else if (preset === 'yesterday') {
      dateCondition = 'WHERE pay.paid_at::date = CURRENT_DATE - 1';
    } else if (preset === 'last7days') {
      dateCondition = "WHERE pay.paid_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (preset === 'last30days') {
      dateCondition = "WHERE pay.paid_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (from && to) {
      params.push(from, to);
      dateCondition = 'WHERE pay.paid_at::date >= $1::date AND pay.paid_at::date <= $2::date';
    } else if (from) {
      params.push(from);
      dateCondition = 'WHERE pay.paid_at::date >= $1::date';
    } else {
      // Default: current month
      dateCondition = "WHERE pay.paid_at >= date_trunc('month', CURRENT_DATE)";
    }

    // Method breakdown
    const { rows: methodRows } = await query(
      `SELECT 
         pay.method,
         COUNT(*)::int AS count,
         COALESCE(SUM(pay.amount), 0)::float AS total_amount
       FROM payments pay
       ${dateCondition}
       GROUP BY pay.method`,
      params
    );

    // Audit status breakdown
    const { rows: auditStatusRows } = await query(
      `SELECT 
         COALESCE(pay.audit_status, 'pending_audit') AS audit_status,
         COUNT(*)::int AS count,
         COALESCE(SUM(pay.amount), 0)::float AS total_amount
       FROM payments pay
       ${dateCondition}
       GROUP BY pay.audit_status`,
      params
    );

    // Staff Cashier breakdown (who collected what)
    const { rows: staffRows } = await query(
      `SELECT 
         pay.recorded_by,
         COALESCE(rec.full_name, u.email, 'Online / System') AS staff_name,
         u.email AS staff_email,
         COUNT(*)::int AS count,
         COALESCE(SUM(pay.amount), 0)::float AS total_amount,
         COALESCE(SUM(CASE WHEN pay.method = 'cash' THEN pay.amount ELSE 0 END), 0)::float AS cash_total,
         COALESCE(SUM(CASE WHEN pay.method = 'upi_offline' THEN pay.amount ELSE 0 END), 0)::float AS upi_total,
         COALESCE(SUM(CASE WHEN pay.method = 'card_offline' THEN pay.amount ELSE 0 END), 0)::float AS card_total,
         COALESCE(SUM(CASE WHEN pay.method NOT IN ('cash', 'upi_offline', 'card_offline') THEN pay.amount ELSE 0 END), 0)::float AS other_total
       FROM payments pay
       LEFT JOIN users u ON u.id = pay.recorded_by
       LEFT JOIN receptionists rec ON rec.user_id = u.id
       ${dateCondition}
       GROUP BY pay.recorded_by, rec.full_name, u.email
       ORDER BY total_amount DESC`,
      params
    );

    // Overall Totals
    const totalRevenue = methodRows.reduce((acc, r) => acc + (r.total_amount || 0), 0);
    const totalTransactions = methodRows.reduce((acc, r) => acc + (r.count || 0), 0);

    res.json({
      totalRevenue,
      totalTransactions,
      methodBreakdown: methodRows,
      auditStatusBreakdown: auditStatusRows,
      staffBreakdown: staffRows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. Payment Auditing Transactions List with Full Filters & Details
 */
router.get('/audit/transactions', requirePermission('payments.audit'), async (req, res, next) => {
  try {
    const {
      from,
      to,
      preset,
      method,
      auditStatus,
      staffId,
      doctorId,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const conditions = [];
    const params = [];

    if (preset === 'today') {
      conditions.push('pay.paid_at::date = CURRENT_DATE');
    } else if (preset === 'yesterday') {
      conditions.push('pay.paid_at::date = CURRENT_DATE - 1');
    } else if (preset === 'last7days') {
      conditions.push("pay.paid_at >= CURRENT_DATE - INTERVAL '7 days'");
    } else if (preset === 'last30days') {
      conditions.push("pay.paid_at >= CURRENT_DATE - INTERVAL '30 days'");
    } else if (from && to) {
      params.push(from, to);
      conditions.push(`pay.paid_at::date >= $${params.length - 1}::date AND pay.paid_at::date <= $${params.length}::date`);
    } else if (from) {
      params.push(from);
      conditions.push(`pay.paid_at::date >= $${params.length}::date`);
    }

    if (method && method !== 'all') {
      params.push(method);
      conditions.push(`pay.method = $${params.length}`);
    }

    if (auditStatus && auditStatus !== 'all') {
      params.push(auditStatus);
      conditions.push(`COALESCE(pay.audit_status, 'pending_audit') = $${params.length}`);
    }

    if (staffId && staffId !== 'all') {
      params.push(staffId);
      conditions.push(`pay.recorded_by = $${params.length}`);
    }

    if (doctorId && doctorId !== 'all') {
      params.push(doctorId);
      conditions.push(`a.doctor_id = $${params.length}`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(
        p.full_name ILIKE $${params.length} OR
        p.phone ILIKE $${params.length} OR
        pay.transaction_ref ILIKE $${params.length} OR
        pay.notes ILIKE $${params.length} OR
        d.full_name ILIKE $${params.length}
      )`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM payments pay
      JOIN appointments a ON a.id = pay.appointment_id
      JOIN patients p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      ${whereSql}
    `;
    const { rows: countRows } = await query(countSql, params);
    const total = countRows[0]?.count || 0;

    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const sql = `
      SELECT 
        pay.id,
        pay.appointment_id,
        pay.amount::float AS amount,
        pay.method,
        pay.status,
        pay.transaction_ref,
        pay.notes,
        COALESCE(pay.audit_status, 'pending_audit') AS audit_status,
        pay.audited_at,
        pay.audit_notes,
        pay.paid_at,
        pay.created_at,
        a.appointment_date,
        a.appointment_time,
        a.status AS appointment_status,
        p.id AS patient_id,
        p.full_name AS patient_name,
        p.phone AS patient_phone,
        d.id AS doctor_id,
        d.full_name AS doctor_name,
        d.specialization AS doctor_specialization,
        d.consultation_fee::float AS doctor_consultation_fee,
        COALESCE(rec.full_name, u.email, 'Online / System') AS recorded_by_name,
        u.email AS recorded_by_email,
        auditor.email AS audited_by_email
      FROM payments pay
      JOIN appointments a ON a.id = pay.appointment_id
      JOIN patients p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN users u ON u.id = pay.recorded_by
      LEFT JOIN receptionists rec ON rec.user_id = u.id
      LEFT JOIN users auditor ON auditor.id = pay.audited_by
      ${whereSql}
      ORDER BY pay.paid_at DESC NULLS LAST, pay.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const { rows } = await query(sql, params);

    // Fetch line-item services for these payments in one batch
    if (rows.length > 0) {
      const apptIds = rows.map((r) => r.appointment_id);
      const { rows: services } = await query(
        `SELECT * FROM appointment_services WHERE appointment_id = ANY($1::uuid[]) ORDER BY created_at ASC`,
        [apptIds]
      );
      const sMap = {};
      services.forEach((s) => {
        if (!sMap[s.appointment_id]) sMap[s.appointment_id] = [];
        sMap[s.appointment_id].push(s);
      });
      rows.forEach((r) => {
        r.services = sMap[r.appointment_id] || [];
      });
    }

    res.json({
      items: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 4. Bulk Audit Action (Verify or Flag Multiple Payments at once)
 */
router.post('/audit/bulk', requirePermission('payments.audit'), async (req, res, next) => {
  try {
    const { paymentIds, status = 'verified', notes } = req.body;
    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      throw new AppError('paymentIds array is required', 400, 'VALIDATION_ERROR');
    }

    const { rows: updated } = await query(
      `UPDATE payments
       SET audit_status = $1,
           audited_by = $2,
           audited_at = NOW(),
           audit_notes = COALESCE($3, audit_notes)
       WHERE id = ANY($4::uuid[])
       RETURNING id, appointment_id, audit_status`,
      [status, req.user.id, notes || null, paymentIds]
    );

    const action = status === 'verified' ? 'AUDIT_VERIFIED' : (status === 'flagged' ? 'AUDIT_FLAGGED' : 'AUDIT_RESET');
    for (const p of updated) {
      await query(
        `INSERT INTO payment_audit_logs (payment_id, appointment_id, action, performed_by, new_values, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p.id,
          p.appointment_id,
          action,
          req.user.id,
          JSON.stringify({ audit_status: status, audit_notes: notes }),
          notes || `Bulk audit action: marked as ${status}`,
        ]
      );
    }

    res.json({ success: true, updatedCount: updated.length });
  } catch (err) {
    next(err);
  }
});

/**
 * 5. Audit Single Payment (Mark Verified or Flag Discrepancy)
 */
router.post('/:paymentId/audit', requirePermission('payments.audit'), async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const data = auditPaymentInput.parse(req.body);

    const { rows: existing } = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    if (!existing[0]) throw new AppError('Payment record not found', 404, 'NOT_FOUND');

    const payment = existing[0];

    const { rows: updated } = await query(
      `UPDATE payments
       SET audit_status = $1,
           audited_by = $2,
           audited_at = NOW(),
           audit_notes = $3
       WHERE id = $4
       RETURNING *`,
      [data.status, req.user.id, data.notes || null, paymentId]
    );

    const action = data.status === 'verified' ? 'AUDIT_VERIFIED' : (data.status === 'flagged' ? 'AUDIT_FLAGGED' : 'AUDIT_RESET');

    await query(
      `INSERT INTO payment_audit_logs (payment_id, appointment_id, action, performed_by, old_values, new_values, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        paymentId,
        payment.appointment_id,
        action,
        req.user.id,
        JSON.stringify({ audit_status: payment.audit_status, audit_notes: payment.audit_notes }),
        JSON.stringify({ audit_status: data.status, audit_notes: data.notes }),
        data.notes || `Payment marked as ${data.status} during audit review`,
      ]
    );

    res.json(updated[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

/**
 * 5. Fetch Full Audit Trail / History for a Payment
 */
router.get('/:paymentId/audit-trail', requirePermission('payments.audit'), async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { rows } = await query(
      `SELECT 
         pal.*,
         u.email AS performed_by_email,
         COALESCE(rec.full_name, doc.full_name, u.email) AS performed_by_name
       FROM payment_audit_logs pal
       LEFT JOIN users u ON u.id = pal.performed_by
       LEFT JOIN receptionists rec ON rec.user_id = u.id
       LEFT JOIN doctors doc ON doc.user_id = u.id
       WHERE pal.payment_id = $1
       ORDER BY pal.created_at ASC`,
      [paymentId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * 6. Payment Receipt
 */
router.get('/:appointmentId/receipt', requirePermission('payments.receipt'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT pay.*, a.appointment_date, a.appointment_time,
              p.full_name AS patient_name, p.phone AS patient_phone,
              p.gender AS patient_gender, p.date_of_birth AS patient_dob,
              d.full_name AS doctor_name, d.specialization AS doctor_specialization, d.consultation_fee,
              u.email AS recorded_by_email,
              COALESCE(rec.full_name, u.email) AS recorded_by_name,
              cs.value AS clinic_name
       FROM payments pay
       JOIN appointments a ON a.id = pay.appointment_id
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       LEFT JOIN users u ON u.id = pay.recorded_by
       LEFT JOIN receptionists rec ON rec.user_id = u.id
       LEFT JOIN clinic_settings cs ON cs.key = 'clinic_name'
       WHERE pay.appointment_id = $1`,
      [req.params.appointmentId]
    );
    if (!rows[0]) throw new AppError('Payment not found', 404, 'NOT_FOUND');

    const { rows: services } = await query(
      `SELECT * FROM appointment_services WHERE appointment_id = $1 ORDER BY created_at ASC`,
      [req.params.appointmentId]
    );

    const { rows: contact } = await query(
      `SELECT content FROM website_content WHERE section_key = 'contact'`
    );

    res.json({
      ...rows[0],
      services,
      clinic_name: rows[0].clinic_name || 'Pulse Multi-Specialty Clinic',
      contact: contact[0]?.content || {},
    });
  } catch (err) {
    next(err);
  }
});

export default router;
