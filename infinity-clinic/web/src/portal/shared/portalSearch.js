/** Client-side search helper for portal lists and tables */

export function matchesSearch(query, ...fields) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f ?? '').toLowerCase().includes(q));
}

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses', hint: 'Show every appointment regardless of status.' },
  { value: 'pending', label: 'Pending', hint: 'Booked but not yet confirmed by the clinic.' },
  { value: 'confirmed', label: 'Confirmed', hint: 'Expected to visit — not checked in yet.' },
  { value: 'checked_in', label: 'Checked in', hint: 'Patient arrived; token issued.' },
  { value: 'in_consultation', label: 'In consultation', hint: 'Currently with the doctor.' },
  { value: 'completed', label: 'Completed', hint: 'Visit finished.' },
  { value: 'cancelled', label: 'Cancelled', hint: 'Appointment was cancelled.' },
  { value: 'no_show', label: 'No show', hint: 'Patient did not arrive.' },
];

export const TOKEN_STATUS_OPTIONS = [
  { value: 'all', label: 'All queue', hint: 'Everyone in today\'s OPD queue.' },
  { value: 'waiting', label: 'Waiting', hint: 'In queue — not yet called.' },
  { value: 'called', label: 'Called', hint: 'Doctor announced — ready to enter.' },
  { value: 'in_consultation', label: 'In consultation', hint: 'Currently with the doctor.' },
  { value: 'completed', label: 'Completed', hint: 'Consultation finished.' },
  { value: 'skipped', label: 'Skipped', hint: 'Passed over — can be called again.' },
];

export const PHARMACY_STATUS_OPTIONS = [
  { value: 'all', label: 'All', hint: 'Every prescription in the queue.' },
  { value: 'pending', label: 'Waiting', hint: 'Ready to dispense — not started yet.' },
  { value: 'dispensing', label: 'In progress', hint: 'Pharmacist is preparing medicines.' },
];
