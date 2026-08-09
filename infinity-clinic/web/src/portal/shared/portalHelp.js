/** User-facing labels and descriptions for portal UI */

export const PAGE_HELP = {
  doctorDashboard: {
    title: 'Consultation Room',
    subtitle: 'See your queue, consult patients, and write prescriptions.',
    description: 'Patients appear here after reception checks them in. Use Call to announce, Start to open the consultation, then Complete Visit when done. Prescriptions go to the pharmacy automatically.',
  },
  doctorAppointments: {
    title: "Today's Appointments",
    subtitle: 'Everyone booked with you today.',
    description: 'Includes online bookings, phone bookings, and walk-ins. Status shows whether they have arrived, are with you, or have finished.',
  },
  doctorHistory: {
    title: 'Consultation History',
    subtitle: 'Your past visits with patients.',
    description: 'Search by patient name, complaint, or diagnosis. Click a patient name to see their full profile and prescriptions.',
  },
  doctorPatients: {
    title: 'Patients',
    subtitle: 'Look up anyone you have seen or will see.',
    description: 'Type at least 2 characters of name or phone. Open a patient to view demographics and your past consultations with them.',
  },
  receptionistDashboard: {
    title: 'Reception Desk',
    subtitle: "Today's front-desk overview.",
    description: 'Check in patients when they arrive to issue an OPD token. The doctor sees them in their queue instantly. Use Walk-in for patients without a prior booking.',
  },
  receptionistAppointments: {
    title: 'Appointments',
    subtitle: 'Bookings for any date — confirm, check in, reschedule, or collect payment.',
    description: 'Pending = not yet confirmed. Confirmed = expected today. Checked in = token issued and in queue. Use actions on each row to manage the visit.',
  },
  receptionistPatients: {
    title: 'Patients',
    subtitle: 'Register and update patient records.',
    description: 'Search by phone or name. Add new patients for walk-ins or update details before their visit.',
  },
  receptionistWalkIn: {
    title: 'Walk-in Registration',
    subtitle: 'Register a patient who arrived without an appointment.',
    description: 'Creates a same-day appointment. After saving, go to the dashboard and Check In the patient to send them to the doctor\'s queue.',
  },
  pharmacyDashboard: {
    title: 'Pharmacy Desk',
    subtitle: 'Prescriptions sent when doctors finish a visit.',
    description: 'New prescriptions appear automatically. Select one to see medicines, then Mark as Dispensed when handed to the patient.',
  },
  pharmacyHistory: {
    title: 'Dispensed History',
    subtitle: 'Medicines you have already given out.',
    description: 'Search by patient, doctor, or medicine name. Useful for lookups and end-of-day review.',
  },
  adminDashboard: {
    title: 'Admin Dashboard',
    subtitle: 'Clinic-wide numbers at a glance.',
    description: 'Track patients, doctors, today\'s load, and recent revenue. Use quick links to manage staff, appointments, and the public website.',
  },
  adminAppointments: {
    title: 'All Appointments',
    subtitle: 'Every booking across all doctors.',
    description: 'Filter by date, doctor, or status. Search by patient name or phone to find a specific visit.',
  },
  adminDoctors: {
    title: 'Doctors',
    subtitle: 'Manage doctor profiles and OPD schedules.',
    description: 'Add specialists, set consultation fees, and define weekly time slots patients can book online.',
  },
  adminReceptionists: {
    title: 'Receptionists',
    subtitle: 'Front-desk staff accounts.',
    description: 'Receptionists can check in patients, manage appointments, and record payments. Deactivate accounts when someone leaves.',
  },
  adminSettings: {
    title: 'Clinic Settings',
    subtitle: 'Name, phone, address, and booking rules.',
    description: 'Changes here update the public website contact section and internal clinic configuration.',
  },
  adminCms: {
    title: 'Website CMS',
    subtitle: 'Edit what visitors see on the public site.',
    description: 'Update homepage text, services, testimonials, and contact details. Saved content goes live on the marketing website.',
  },
  adminPermissions: {
    title: 'Role Permissions',
    subtitle: 'Control what receptionists and doctors can do.',
    description: 'Toggle access to appointments, patients, prescriptions, and more. Staff should log out and back in after changes.',
  },
};

export const METRIC_HELP = {
  todayTotal: { label: "Today's Total", description: 'All appointments scheduled for today, any status.' },
  awaitingCheckIn: { label: 'Awaiting Check-in', description: 'Booked but patient has not arrived yet.' },
  inClinic: { label: 'In Clinic', description: 'Checked in or currently with the doctor.' },
  completedToday: { label: 'Completed', description: 'Visits finished for today.' },
  pharmacyWaiting: { label: 'Waiting', description: 'Prescription ready — not yet started dispensing.' },
  pharmacyInProgress: { label: 'In Progress', description: 'Pharmacist is preparing this prescription.' },
  pharmacyTotal: { label: 'Total in Queue', description: 'All prescriptions waiting or being dispensed.' },
  totalPatients: { label: 'Total Patients', description: 'Everyone registered in the system.' },
  activeDoctors: { label: 'Active Doctors', description: 'Doctors currently available for booking.' },
  todayAppointments: { label: "Today's Appointments", description: 'All visits scheduled across the clinic today.' },
  todayCompletedAdmin: { label: 'Completed Today', description: 'Consultations finished today, all doctors.' },
  revenue30: { label: 'Revenue (30 days)', description: 'Payments recorded in the last 30 days.' },
  queueCompleted: { label: 'Completed', description: 'Patients you have finished seeing today.' },
  queueWaiting: { label: 'Waiting', description: 'Patients in queue — waiting or called, not yet with you.' },
};

export const FIELD_HELP = {
  chiefComplaint: { title: 'Chief Complaint', hint: 'Main reason the patient came today — in their own words.' },
  diagnosis: { title: 'Diagnosis', hint: 'Your clinical finding or working diagnosis for this visit.' },
  clinicalNotes: { title: 'Clinical Notes', hint: 'Private notes — examination findings, plan, follow-up reminders.' },
  token: { title: 'Token Number', hint: 'Queue number issued at reception when the patient checked in.' },
  medicine: { title: 'Medicine', hint: 'Drug name and strength, e.g. Paracetamol 650mg.' },
  dose: { title: 'Dose', hint: 'How much per dose — e.g. 1 tablet, 5 ml.' },
  timesPerDay: { title: 'Times per day', hint: 'How many times in 24 hours the patient should take it.' },
  whenToTake: { title: 'When to take', hint: 'Morning, afternoon, evening, or night — tap all that apply.' },
  duration: { title: 'Duration', hint: 'How long to continue the medicine, e.g. 5 days or 1 month.' },
  extraInstructions: { title: 'Extra instructions', hint: 'After food, avoid alcohol, etc. (optional)' },
  generalAdvice: { title: 'General advice', hint: 'Lifestyle tips for the patient — diet, rest, follow-up date.' },
  savedMedicines: { title: 'Saved medicines', hint: 'Tap a chip to add it instantly — no need to retype for the next patient.' },
  phone: { title: 'Phone', hint: 'Primary contact number — used for booking and reminders.' },
  email: { title: 'Email', hint: 'Optional — for receipts and online booking.' },
  dobGender: { title: 'Date of birth / Gender', hint: 'Helps with prescriptions and medical records.' },
  address: { title: 'Address', hint: 'Patient\'s residential area or full address.' },
};

export const STATUS_HELP = {
  pending: 'Booked but not yet confirmed by the clinic.',
  confirmed: 'Expected today — patient has not checked in yet.',
  checked_in: 'Patient arrived; OPD token issued and in queue.',
  in_consultation: 'Currently with the doctor.',
  completed: 'Visit finished.',
  cancelled: 'Appointment was cancelled.',
  no_show: 'Patient did not arrive for their slot.',
  waiting: 'In queue — not yet called by doctor.',
  called: 'Doctor announced this patient — ready to enter.',
  skipped: 'Passed over in queue — can be called again.',
  dispensing: 'Pharmacist is preparing this prescription.',
};

export const SECTION_HELP = {
  opdQueue: { title: 'OPD Queue', description: 'Patients checked in today. Call announces them, Start opens the consultation form.' },
  liveQueue: { title: 'Live Queue', description: 'Real-time token list for the selected doctor — updates when patients check in.' },
  todayAppointments: { title: "Today's Appointments", description: 'All bookings for today. Check in patients when they arrive to issue a token.' },
  livePrescriptionQueue: { title: 'Live Prescription Queue', description: 'Click a row to view medicines. Opening a waiting prescription marks it in progress.' },
  appointmentsByStatus: { title: 'Appointments by Status (30 days)', description: 'How visits ended or progressed over the last month — hover a status badge anywhere for meaning.' },
  quickLinks: { title: 'Quick Links', description: 'Jump to common admin and front-desk tasks.' },
  prescription: { title: 'Prescription', description: 'Optional — add medicines only if needed. Leave blank to finish the visit without sending anything to pharmacy.' },
  currentPatient: { title: 'Current Patient', description: 'The person you are consulting right now.' },
};
