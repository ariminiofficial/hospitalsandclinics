/** Structured prescription helpers — shared by form + print */

export const DOSE_OPTIONS = ['1 tablet', '2 tablets', '½ tablet', '5 ml', '10 ml', '1 tsp', '2 tsp', '1 cap', '2 caps'];
export const TIMES_PER_DAY_OPTIONS = [1, 2, 3, 4];
export const DURATION_OPTIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '2 months', '3 months'];
export const TIMING_OPTIONS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
  { key: 'night', label: 'Night' },
];

export const emptyPrescriptionTiming = () => ({
  morning: false,
  afternoon: false,
  evening: false,
  night: false,
});

export const emptyPrescriptionItem = () => ({
  medicineName: '',
  dose: '',
  timesPerDay: '',
  timing: emptyPrescriptionTiming(),
  duration: '',
  instructions: '',
  // legacy string fields (auto-filled on save)
  dosage: '',
  frequency: '',
});

export function formatTimingLabel(timing = {}) {
  return TIMING_OPTIONS.filter((t) => timing[t.key]).map((t) => t.label);
}

export function formatFrequency(timesPerDay, timing = {}) {
  const parts = formatTimingLabel(timing);
  const n = Number(timesPerDay);
  if (n && parts.length) return `${n}× daily — ${parts.join(', ')}`;
  if (n) return `${n} time${n > 1 ? 's' : ''} a day`;
  if (parts.length) return parts.join(', ');
  return '';
}

export function prescriptionItemToStrings(item) {
  const dose = item.dose || item.dosage || '';
  const frequency = formatFrequency(item.timesPerDay, item.timing);
  return {
    dosage: dose,
    frequency,
    duration: item.duration || '',
    instructions: item.instructions || '',
  };
}

export function normalizePrescriptionItem(raw = {}) {
  const timing = {
    morning: Boolean(raw.timing_morning ?? raw.timing?.morning),
    afternoon: Boolean(raw.timing_afternoon ?? raw.timing?.afternoon),
    evening: Boolean(raw.timing_evening ?? raw.timing?.evening),
    night: Boolean(raw.timing_night ?? raw.timing?.night),
  };
  const dose = raw.dose || raw.dosage || '';
  const timesPerDay = raw.times_per_day ?? raw.timesPerDay ?? '';
  return {
    medicineName: raw.medicine_name || raw.medicineName || '',
    dose,
    timesPerDay: timesPerDay === '' ? '' : Number(timesPerDay),
    timing,
    duration: raw.duration || '',
    instructions: raw.instructions || '',
    dosage: dose,
    frequency: raw.frequency || formatFrequency(timesPerDay, timing),
  };
}

export function templateToPrescriptionItem(template) {
  return normalizePrescriptionItem({
    medicine_name: template.medicine_name,
    dose: template.dose,
    times_per_day: template.times_per_day,
    timing_morning: template.timing_morning,
    timing_afternoon: template.timing_afternoon,
    timing_evening: template.timing_evening,
    timing_night: template.timing_night,
    duration: template.duration,
    instructions: template.instructions,
  });
}
