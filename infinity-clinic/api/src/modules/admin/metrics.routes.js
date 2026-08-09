import { Router } from 'express';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const [appointments, patients, doctors, revenue] = await Promise.all([
      query(`SELECT status, COUNT(*)::int AS count FROM appointments
             WHERE appointment_date >= CURRENT_DATE - INTERVAL '30 days'
             GROUP BY status`),
      query('SELECT COUNT(*)::int AS count FROM patients'),
      query('SELECT COUNT(*)::int AS count FROM doctors WHERE is_active = true'),
      query(`SELECT COALESCE(SUM(amount), 0)::float AS total FROM payments
             WHERE status = 'completed' AND paid_at >= CURRENT_DATE - INTERVAL '30 days'`),
    ]);

    const todayAppts = await query(
      `SELECT COUNT(*)::int AS count FROM appointments WHERE appointment_date = CURRENT_DATE`
    );
    const todayCompleted = await query(
      `SELECT COUNT(*)::int AS count FROM appointments
       WHERE appointment_date = CURRENT_DATE AND status = 'completed'`
    );

    res.json({
      totalPatients: patients.rows[0].count,
      activeDoctors: doctors.rows[0].count,
      revenueLast30Days: revenue.rows[0].total,
      appointmentsByStatus: Object.fromEntries(appointments.rows.map((r) => [r.status, r.count])),
      todayAppointments: todayAppts.rows[0].count,
      todayCompleted: todayCompleted.rows[0].count,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
