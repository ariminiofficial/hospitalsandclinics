/**
 * Infinity Clinic — database schema reference (source of truth)
 * Derived from migrations/001_initial_schema.sql
 * All API validators and frontend form payloads MUST align with these definitions.
 */

import { z } from 'zod';

// ─── Enums (match CHECK constraints in PostgreSQL) ───────────────────────────

export const UserRole = z.enum(['admin', 'doctor', 'receptionist', 'pharmacist']);

export const AppointmentStatus = z.enum([
  'pending',
  'confirmed',
  'checked_in',
  'in_consultation',
  'completed',
  'cancelled',
  'no_show',
]);

export const BookedVia = z.enum(['website', 'walk_in', 'phone']);

export const OpdTokenStatus = z.enum([
  'waiting',
  'called',
  'in_consultation',
  'completed',
  'skipped',
]);

export const PaymentMethod = z.enum(['cash', 'card_offline', 'upi_offline', 'razorpay']);

export const PaymentStatus = z.enum(['pending', 'completed', 'failed', 'refunded']);

// ─── Reusable field validators ───────────────────────────────────────────────

export const uuid = z.string().uuid();
export const phone = z.string().min(10).max(15);
export const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
export const timeStr = z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:MM');
export const email = z.string().email();

// ─── Table column maps (DB snake_case) ───────────────────────────────────────

export const Tables = {
  users: ['id', 'email', 'password_hash', 'role', 'is_active', 'created_at', 'updated_at'],
  doctors: ['id', 'user_id', 'full_name', 'specialization', 'qualification', 'bio', 'photo_url', 'consultation_fee', 'is_active', 'created_at', 'updated_at'],
  doctor_schedules: ['id', 'doctor_id', 'day_of_week', 'start_time', 'end_time', 'slot_duration_minutes', 'is_active', 'created_at'],
  pharmacists: ['id', 'user_id', 'full_name', 'is_active', 'created_at', 'updated_at'],
  receptionists: ['id', 'user_id', 'full_name', 'is_active', 'created_at', 'updated_at'],
  patients: ['id', 'phone', 'full_name', 'email', 'date_of_birth', 'gender', 'address', 'created_at', 'updated_at'],
  appointments: ['id', 'patient_id', 'doctor_id', 'appointment_date', 'appointment_time', 'status', 'notes', 'booked_via', 'created_at', 'updated_at'],
  opd_token_counters: ['doctor_id', 'visit_date', 'last_token'],
  opd_tokens: ['id', 'appointment_id', 'doctor_id', 'visit_date', 'token_number', 'status', 'called_at', 'completed_at', 'created_at'],
  consultations: ['id', 'appointment_id', 'doctor_id', 'patient_id', 'chief_complaint', 'diagnosis', 'notes', 'created_at', 'updated_at'],
  prescriptions: ['id', 'consultation_id', 'doctor_id', 'patient_id', 'advice', 'pharmacy_status', 'dispensed_at', 'dispensed_by', 'created_at'],
  prescription_items: ['id', 'prescription_id', 'medicine_name', 'dosage', 'frequency', 'duration', 'instructions', 'dose', 'times_per_day', 'timing_morning', 'timing_afternoon', 'timing_evening', 'timing_night', 'sort_order'],
  medicine_templates: ['id', 'doctor_id', 'medicine_name', 'dose', 'times_per_day', 'timing_morning', 'timing_afternoon', 'timing_evening', 'timing_night', 'duration', 'instructions', 'use_count', 'last_used_at', 'created_at'],
  payments: ['id', 'appointment_id', 'amount', 'method', 'status', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'recorded_by', 'paid_at', 'created_at'],
  website_content: ['id', 'section_key', 'content', 'is_published', 'updated_at'],
  testimonials: ['id', 'patient_name', 'content', 'rating', 'is_published', 'sort_order', 'created_at'],
  services: ['id', 'title', 'description', 'icon', 'is_published', 'sort_order', 'created_at'],
  clinic_settings: ['key', 'value', 'updated_at'],
  audit_log: ['id', 'user_id', 'action', 'entity_type', 'entity_id', 'details', 'created_at'],
};

// ─── API request schemas (camelCase in JSON → mapped to snake_case in SQL) ───

/** patients table */
export const patientInput = z.object({
  phone,
  fullName: z.string().min(2),
  email: email.optional().or(z.literal('')),
  dateOfBirth: dateStr.optional(),
  gender: z.string().max(20).optional(),
  address: z.string().optional(),
});

/** appointments table — public booking */
export const bookAppointmentInput = z.object({
  doctorId: uuid,
  appointmentDate: dateStr,
  appointmentTime: timeStr,
  patient: patientInput.pick({ phone: true, fullName: true, email: true, dateOfBirth: true, gender: true }),
});

/** appointments table — walk-in */
export const walkInInput = z.object({
  doctorId: uuid,
  patientId: uuid.optional(),
  patient: patientInput.pick({ phone: true, fullName: true, email: true, gender: true }).optional(),
  notes: z.string().optional(),
});

/** appointments table — reschedule */
export const rescheduleInput = z.object({
  appointmentDate: dateStr,
  appointmentTime: timeStr,
});

/** doctors table + users */
export const doctorInput = z.object({
  email,
  password: z.string().min(6).optional(),
  fullName: z.string().min(2),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  consultationFee: z.number().min(0).optional(),
});

/** doctor_schedules table */
export const doctorScheduleInput = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: timeStr,
  endTime: timeStr,
  slotDurationMinutes: z.number().int().min(5).max(60).optional(),
});

/** receptionists table + users */
export const receptionistInput = z.object({
  email,
  password: z.string().min(6).optional(),
  fullName: z.string().min(2),
});

/** consultations table */
export const consultationInput = z.object({
  chiefComplaint: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
});

/** prescription_items table */
export const prescriptionTimingInput = z.object({
  morning: z.boolean().optional(),
  afternoon: z.boolean().optional(),
  evening: z.boolean().optional(),
  night: z.boolean().optional(),
});

export const prescriptionItemInput = z.object({
  medicineName: z.string().min(1),
  dose: z.string().max(50).optional(),
  timesPerDay: z.union([z.coerce.number().int().min(1).max(6), z.literal('')]).optional(),
  timing: prescriptionTimingInput.optional(),
  duration: z.string().max(50).optional(),
  instructions: z.string().optional(),
  // legacy — auto-filled if omitted
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
});

export const medicineTemplateInput = z.object({
  medicineName: z.string().min(1),
  dose: z.string().max(50).optional(),
  timesPerDay: z.union([z.coerce.number().int().min(1).max(6), z.literal('')]).optional(),
  timing: prescriptionTimingInput.optional(),
  duration: z.string().max(50).optional(),
  instructions: z.string().optional(),
});

/** prescriptions table */
export const prescriptionInput = z.object({
  advice: z.string().optional(),
  items: z.array(prescriptionItemInput).min(1),
});

/** payments table */
export const recordPaymentInput = z.object({
  amount: z.number().positive(),
  method: PaymentMethod.exclude(['razorpay']),
});

/** services table */
export const serviceInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().max(100).optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/** testimonials table */
export const testimonialInput = z.object({
  patientName: z.string().min(1),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/** website_content table */
export const websiteContentInput = z.object({
  content: z.record(z.unknown()),
  isPublished: z.boolean().optional(),
});

/** clinic_settings table */
export const clinicSettingInput = z.object({
  value: z.unknown(),
});

/** auth */
export const loginInput = z.object({
  email,
  password: z.string().min(6),
});

// ─── DB → API field mapping helpers ──────────────────────────────────────────

/** Map patient form (camelCase) to SQL insert/update params */
export function patientToDb(data) {
  return {
    phone: data.phone,
    full_name: data.fullName,
    email: data.email || null,
    date_of_birth: data.dateOfBirth || null,
    gender: data.gender || null,
    address: data.address || null,
  };
}

/** Map prescription item form to SQL insert params */
export function prescriptionItemToDb(item, prescriptionId, sortOrder) {
  const timing = item.timing || {};
  const dose = item.dose || item.dosage || null;
  const timesPerDay = item.timesPerDay ? Number(item.timesPerDay) : null;
  const parts = [];
  if (timing.morning) parts.push('Morning');
  if (timing.afternoon) parts.push('Afternoon');
  if (timing.evening) parts.push('Evening');
  if (timing.night) parts.push('Night');
  let frequency = item.frequency || null;
  if (!frequency && (timesPerDay || parts.length)) {
    frequency = timesPerDay && parts.length
      ? `${timesPerDay}× daily — ${parts.join(', ')}`
      : timesPerDay
        ? `${timesPerDay} time${timesPerDay > 1 ? 's' : ''} a day`
        : parts.join(', ');
  }
  return {
    prescription_id: prescriptionId,
    medicine_name: item.medicineName,
    dosage: dose,
    frequency,
    duration: item.duration || null,
    instructions: item.instructions || null,
    dose,
    times_per_day: timesPerDay,
    timing_morning: Boolean(timing.morning),
    timing_afternoon: Boolean(timing.afternoon),
    timing_evening: Boolean(timing.evening),
    timing_night: Boolean(timing.night),
    sort_order: sortOrder,
  };
}

/** Map testimonial form to SQL insert params */
export function testimonialToDb(data) {
  return {
    patient_name: data.patientName,
    content: data.content,
    rating: data.rating ?? null,
    is_published: data.isPublished !== false,
    sort_order: data.sortOrder ?? 0,
  };
}

/** Map service form to SQL insert params */
export function serviceToDb(data) {
  return {
    title: data.title,
    description: data.description || null,
    icon: data.icon || null,
    is_published: data.isPublished !== false,
    sort_order: data.sortOrder ?? 0,
  };
}

/** Status helpers */
export const APPOINTMENT_CHECK_IN_ALLOWED = ['pending', 'confirmed'];
export const APPOINTMENT_CANCEL_BLOCKED = ['completed', 'cancelled'];
export const APPOINTMENT_NO_SHOW_ALLOWED = ['pending', 'confirmed'];
export const APPOINTMENT_RESCHEDULE_BLOCKED = ['completed', 'cancelled', 'checked_in', 'in_consultation'];

export default {
  Tables,
  UserRole,
  AppointmentStatus,
  BookedVia,
  OpdTokenStatus,
  PaymentMethod,
  PaymentStatus,
};
