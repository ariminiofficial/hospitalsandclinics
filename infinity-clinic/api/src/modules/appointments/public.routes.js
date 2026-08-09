import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { bookingLimiter } from '../../middleware/rateLimit.js';
import { AppError } from '../../middleware/errorHandler.js';
import { notificationService } from '../../notifications/NotificationService.js';
import { bookAppointmentInput } from '../../schema/index.js';

const router = Router();

router.get('/doctors/:doctorId/slots', async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) {
      throw new AppError('Date is required', 400, 'VALIDATION_ERROR');
    }

    const dayOfWeek = new Date(date).getDay();
    const { rows: schedules } = await query(
      `SELECT start_time, end_time, slot_duration_minutes FROM doctor_schedules
       WHERE doctor_id = $1 AND day_of_week = $2 AND is_active = true`,
      [doctorId, dayOfWeek]
    );

    if (schedules.length === 0) {
      return res.json({ slots: [] });
    }

    const { rows: booked } = await query(
      `SELECT appointment_time FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2
       AND status NOT IN ('cancelled', 'no_show')`,
      [doctorId, date]
    );
    const bookedTimes = new Set(booked.map((b) => b.appointment_time.slice(0, 5)));

    const slots = [];
    for (const schedule of schedules) {
      const [startH, startM] = schedule.start_time.split(':').map(Number);
      const [endH, endM] = schedule.end_time.split(':').map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;
      const duration = schedule.slot_duration_minutes;

      while (current + duration <= end) {
        const h = String(Math.floor(current / 60)).padStart(2, '0');
        const m = String(current % 60).padStart(2, '0');
        const time = `${h}:${m}`;
        if (!bookedTimes.has(time)) {
          slots.push(time);
        }
        current += duration;
      }
    }

    res.json({ slots });
  } catch (err) {
    next(err);
  }
});

router.post('/', bookingLimiter, async (req, res, next) => {
  try {
    const data = bookAppointmentInput.parse(req.body);

    let { rows: patients } = await query(
      'SELECT id FROM patients WHERE phone = $1',
      [data.patient.phone]
    );

    let patientId;
    if (patients.length === 0) {
      const inserted = await query(
        `INSERT INTO patients (phone, full_name, email, date_of_birth, gender)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          data.patient.phone,
          data.patient.fullName,
          data.patient.email || null,
          data.patient.dateOfBirth || null,
          data.patient.gender || null,
        ]
      );
      patientId = inserted.rows[0].id;
    } else {
      patientId = patients[0].id;
      await query(
        `UPDATE patients SET full_name = $1, email = COALESCE($2, email),
         date_of_birth = COALESCE($3, date_of_birth), gender = COALESCE($4, gender),
         updated_at = NOW() WHERE id = $5`,
        [
          data.patient.fullName,
          data.patient.email || null,
          data.patient.dateOfBirth || null,
          data.patient.gender || null,
          patientId,
        ]
      );
    }

    const { rows } = await query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, booked_via)
       VALUES ($1, $2, $3, $4, 'pending', 'website') RETURNING *`,
      [patientId, data.doctorId, data.appointmentDate, data.appointmentTime]
    );

    await notificationService.sendAppointmentConfirmation(rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    }
    if (err.code === '23505') {
      return next(new AppError('This slot is already booked', 409, 'SLOT_TAKEN'));
    }
    next(err);
  }
});

export default router;
