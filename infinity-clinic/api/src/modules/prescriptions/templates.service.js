import { prescriptionItemToDb } from '../../schema/index.js';

export async function upsertMedicineTemplates(client, doctorId, items) {
  for (const item of items) {
    if (!item.medicineName?.trim()) continue;
    const db = prescriptionItemToDb(item, null, 0);
    await client.query(
      `INSERT INTO medicine_templates (
         doctor_id, medicine_name, dose, times_per_day,
         timing_morning, timing_afternoon, timing_evening, timing_night,
         duration, instructions, use_count, last_used_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1, NOW())
       ON CONFLICT (doctor_id, medicine_name) DO UPDATE SET
         dose = EXCLUDED.dose,
         times_per_day = EXCLUDED.times_per_day,
         timing_morning = EXCLUDED.timing_morning,
         timing_afternoon = EXCLUDED.timing_afternoon,
         timing_evening = EXCLUDED.timing_evening,
         timing_night = EXCLUDED.timing_night,
         duration = EXCLUDED.duration,
         instructions = EXCLUDED.instructions,
         use_count = medicine_templates.use_count + 1,
         last_used_at = NOW()`,
      [
        doctorId,
        item.medicineName.trim(),
        db.dose,
        db.times_per_day,
        db.timing_morning,
        db.timing_afternoon,
        db.timing_evening,
        db.timing_night,
        db.duration,
        db.instructions,
      ]
    );
  }
}

export function templateRowToApi(row) {
  return {
    id: row.id,
    medicineName: row.medicine_name,
    dose: row.dose || '',
    timesPerDay: row.times_per_day || '',
    timing: {
      morning: row.timing_morning,
      afternoon: row.timing_afternoon,
      evening: row.timing_evening,
      night: row.timing_night,
    },
    duration: row.duration || '',
    instructions: row.instructions || '',
    useCount: row.use_count,
    lastUsedAt: row.last_used_at,
  };
}
