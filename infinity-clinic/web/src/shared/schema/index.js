/**
 * Frontend schema reference — mirrors api/src/schema/index.js
 * Use these enums and field names in portal forms and API payloads.
 */

export const AppointmentStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  IN_CONSULTATION: 'in_consultation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const OpdTokenStatus = {
  WAITING: 'waiting',
  CALLED: 'called',
  IN_CONSULTATION: 'in_consultation',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
};

export const PaymentMethod = {
  CASH: 'cash',
  CARD_OFFLINE: 'card_offline',
  UPI_OFFLINE: 'upi_offline',
};

export const BookedVia = {
  WEBSITE: 'website',
  WALK_IN: 'walk_in',
  PHONE: 'phone',
};

/** Empty form defaults aligned with API request schemas */
export const emptyPatientForm = () => ({
  phone: '',
  fullName: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  address: '',
});

export const emptyDoctorForm = () => ({
  email: '',
  password: '',
  fullName: '',
  specialization: '',
  qualification: '',
  bio: '',
  consultationFee: 0,
});

export const emptyReceptionistForm = () => ({
  email: '',
  password: '',
  fullName: '',
});

export const emptyWalkInForm = () => ({
  doctorId: '',
  phone: '',
  fullName: '',
  notes: '',
});

export const emptyBookingForm = () => ({
  doctorId: '',
  appointmentDate: '',
  appointmentTime: '',
  phone: '',
  fullName: '',
  email: '',
});

export const emptyConsultationNotes = () => ({
  chiefComplaint: '',
  diagnosis: '',
  notes: '',
});

export const emptyPrescriptionItem = () => ({
  medicineName: '',
  dose: '',
  timesPerDay: '',
  timing: { morning: false, afternoon: false, evening: false, night: false },
  duration: '',
  instructions: '',
  dosage: '',
  frequency: '',
});

export const emptyPaymentForm = () => ({
  amount: '',
  method: PaymentMethod.CASH,
});

export const emptyTestimonialForm = () => ({
  patientName: '',
  content: '',
  rating: 5,
});

export const emptyServiceForm = () => ({
  title: '',
  description: '',
  icon: '',
});

/** DB column names returned by API (snake_case) — use when reading responses */
export const DbFields = {
  patient: ['id', 'phone', 'full_name', 'email', 'date_of_birth', 'gender', 'address'],
  appointment: ['id', 'patient_id', 'doctor_id', 'appointment_date', 'appointment_time', 'status', 'notes', 'booked_via'],
  doctor: ['id', 'full_name', 'specialization', 'qualification', 'bio', 'consultation_fee', 'is_active'],
  opdToken: ['id', 'appointment_id', 'doctor_id', 'visit_date', 'token_number', 'status'],
  consultation: ['id', 'appointment_id', 'doctor_id', 'patient_id', 'chief_complaint', 'diagnosis', 'notes'],
  payment: ['id', 'appointment_id', 'amount', 'method', 'status', 'paid_at'],
};
