/** Permission catalog — single source of truth for RBAC */

export const PERMISSION_CATALOG = [
  {
    group: 'Reception Desk',
    permissions: [
      { key: 'appointments.view', label: 'View appointments', description: 'See appointment lists and dashboard' },
      { key: 'appointments.confirm', label: 'Confirm bookings', description: 'Confirm pending online/phone bookings' },
      { key: 'appointments.check_in', label: 'Check in patients', description: 'Issue OPD token on arrival' },
      { key: 'appointments.reschedule', label: 'Reschedule', description: 'Change date or time' },
      { key: 'appointments.cancel', label: 'Cancel appointments', description: 'Cancel upcoming visits' },
      { key: 'appointments.no_show', label: 'Mark no-show', description: 'Mark patient as no-show' },
      { key: 'appointments.walk_in', label: 'Walk-in registration', description: 'Create same-day walk-in appointments' },
    ],
  },
  {
    group: 'Patients',
    permissions: [
      { key: 'patients.search', label: 'Search patients', description: 'Find patients by name or phone' },
      { key: 'patients.view', label: 'View patient profile', description: 'See patient demographics' },
      { key: 'patients.create', label: 'Register patients', description: 'Add new patient records' },
      { key: 'patients.edit', label: 'Edit patients', description: 'Update patient details' },
      { key: 'patients.history', label: 'View visit history', description: 'See past appointments and consultations' },
    ],
  },
  {
    group: 'OPD Queue',
    permissions: [
      { key: 'opd.view_queue', label: 'View live queue', description: 'See real-time OPD token queue' },
      { key: 'opd.view_today', label: "View today's OPD list", description: 'See all appointments for today' },
    ],
  },
  {
    group: 'Payments',
    permissions: [
      { key: 'payments.record', label: 'Record payment', description: 'Record cash/card/UPI offline payment' },
      { key: 'payments.receipt', label: 'Print receipt', description: 'Generate payment receipt' },
    ],
  },
  {
    group: 'Consultations',
    permissions: [
      { key: 'consultations.view_queue', label: 'View consultation queue', description: 'See patients waiting for consultation' },
      { key: 'consultations.call', label: 'Call patient', description: 'Call next token to consultation room' },
      { key: 'consultations.start', label: 'Start consultation', description: 'Begin consultation with patient' },
      { key: 'consultations.skip', label: 'Skip token', description: 'Skip patient in queue' },
      { key: 'consultations.notes', label: 'Write clinical notes', description: 'Record complaint, diagnosis, notes' },
      { key: 'consultations.complete', label: 'Complete visit', description: 'Finish consultation' },
      { key: 'consultations.history', label: 'View consultation history', description: 'See past completed consultations' },
      { key: 'consultations.today', label: "View today's schedule", description: 'See own appointments for today' },
    ],
  },
  {
    group: 'Prescriptions',
    permissions: [
      { key: 'prescriptions.write', label: 'Write prescriptions', description: 'Add medicines and advice' },
      { key: 'prescriptions.print', label: 'Print prescriptions', description: 'Print Rx for patient' },
    ],
  },
  {
    group: 'Pharmacy',
    permissions: [
      { key: 'pharmacy.view_queue', label: 'View prescription queue', description: 'See incoming prescriptions from doctors' },
      { key: 'pharmacy.dispense', label: 'Dispense medicines', description: 'Mark prescriptions as dispensed' },
      { key: 'pharmacy.view_history', label: 'View dispensed history', description: 'See past dispensed prescriptions' },
    ],
  },
  {
    group: 'Staff Management',
    permissions: [
      { key: 'staff.doctors', label: 'Manage doctors', description: 'Add, edit, deactivate doctors and schedules' },
      { key: 'staff.receptionists', label: 'Manage receptionists', description: 'Add, edit, deactivate receptionists' },
    ],
  },
  {
    group: 'Website & CMS',
    permissions: [
      { key: 'cms.content', label: 'Edit website content', description: 'Edit all public page CMS sections' },
      { key: 'cms.services', label: 'Manage services', description: 'Add/remove clinic services' },
      { key: 'cms.testimonials', label: 'Manage testimonials', description: 'Add/remove patient stories' },
    ],
  },
  {
    group: 'Clinic Settings',
    permissions: [
      { key: 'settings.clinic', label: 'Clinic settings', description: 'Name, phone, address, slot duration' },
      { key: 'settings.permissions', label: 'Manage permissions', description: 'Control who can do what' },
      { key: 'metrics.view', label: 'View dashboard metrics', description: 'See analytics and revenue' },
    ],
  },
  {
    group: 'Portal Access',
    permissions: [
      { key: 'portal.receptionist', label: 'Receptionist portal', description: 'Access reception desk' },
      { key: 'portal.doctor', label: 'Doctor portal', description: 'Access consultation room' },
      { key: 'portal.pharmacy', label: 'Pharmacy portal', description: 'Access pharmacy desk' },
      { key: 'portal.admin', label: 'Admin portal', description: 'Access admin control panel' },
    ],
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.flatMap((g) => g.permissions.map((p) => p.key));

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: ['*'],
  receptionist: [
    'portal.receptionist',
    'appointments.view', 'appointments.confirm', 'appointments.check_in',
    'appointments.reschedule', 'appointments.cancel', 'appointments.no_show', 'appointments.walk_in',
    'patients.search', 'patients.view', 'patients.create', 'patients.edit', 'patients.history',
    'opd.view_queue', 'opd.view_today',
    'payments.record', 'payments.receipt',
  ],
  doctor: [
    'portal.doctor',
    'patients.search', 'patients.view', 'patients.history',
    'consultations.view_queue', 'consultations.call', 'consultations.start', 'consultations.skip',
    'consultations.notes', 'consultations.complete', 'consultations.history', 'consultations.today',
    'prescriptions.write', 'prescriptions.print',
  ],
  pharmacist: [
    'portal.pharmacy',
    'pharmacy.view_queue', 'pharmacy.dispense', 'pharmacy.view_history',
  ],
};

export const EDITABLE_ROLES = ['receptionist', 'doctor', 'pharmacist'];
