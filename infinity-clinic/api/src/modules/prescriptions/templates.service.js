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
    isFavorite: Boolean(row.is_favorite),
  };
}

export const CLINICAL_FORMULARY = [
  { medicineName: 'Paracetamol 650mg', dose: '1 Tablet', timesPerDay: 3, timing: { morning: true, afternoon: true, night: true }, duration: '3 days', instructions: 'After food for fever or pain' },
  { medicineName: 'Dolo 650mg', dose: '1 Tablet', timesPerDay: 3, timing: { morning: true, afternoon: true, night: true }, duration: '3 days', instructions: 'After meals when required' },
  { medicineName: 'Augmentin 625 Duo (Amoxicillin + Clavulanate)', dose: '1 Tablet', timesPerDay: 2, timing: { morning: true, night: true }, duration: '5 days', instructions: 'Strictly after meals' },
  { medicineName: 'Azithromycin 500mg (Azee 500)', dose: '1 Tablet', timesPerDay: 1, timing: { morning: true }, duration: '3 days', instructions: '1 hour before or 2 hours after meals' },
  { medicineName: 'Pan 40 (Pantoprazole 40mg)', dose: '1 Tablet', timesPerDay: 1, timing: { morning: true }, duration: '7 days', instructions: 'Empty stomach in morning, 30 mins before food' },
  { medicineName: 'Omez D (Omeprazole 20mg + Domperidone 10mg)', dose: '1 Capsule', timesPerDay: 1, timing: { morning: true }, duration: '5 days', instructions: '30 mins before breakfast' },
  { medicineName: 'Montair LC (Montelukast 10mg + Levocetirizine 5mg)', dose: '1 Tablet', timesPerDay: 1, timing: { night: true }, duration: '7 days', instructions: 'At bedtime' },
  { medicineName: 'Cetzine 10mg (Cetirizine)', dose: '1 Tablet', timesPerDay: 1, timing: { night: true }, duration: '5 days', instructions: 'At night before sleep' },
  { medicineName: 'Combiflam (Ibuprofen 400mg + Paracetamol 325mg)', dose: '1 Tablet', timesPerDay: 2, timing: { morning: true, night: true }, duration: '3 days', instructions: 'Strictly after food with water' },
  { medicineName: 'Glycomet 500mg SR (Metformin)', dose: '1 Tablet', timesPerDay: 2, timing: { morning: true, night: true }, duration: '30 days', instructions: 'With or immediately after meals' },
  { medicineName: 'Telma 40 (Telmisartan 40mg)', dose: '1 Tablet', timesPerDay: 1, timing: { morning: true }, duration: '30 days', instructions: 'Once daily after breakfast' },
  { medicineName: 'Amlong 5 (Amlodipine 5mg)', dose: '1 Tablet', timesPerDay: 1, timing: { morning: true }, duration: '30 days', instructions: 'Once daily at fixed time' },
  { medicineName: 'Atorva 10 (Atorvastatin 10mg)', dose: '1 Tablet', timesPerDay: 1, timing: { night: true }, duration: '30 days', instructions: 'At bedtime after dinner' },
  { medicineName: 'Taxim-O 200 (Cefixime 200mg)', dose: '1 Tablet', timesPerDay: 2, timing: { morning: true, night: true }, duration: '5 days', instructions: 'After meals' },
  { medicineName: 'Ciplox 500 (Ciprofloxacin 500mg)', dose: '1 Tablet', timesPerDay: 2, timing: { morning: true, night: true }, duration: '5 days', instructions: 'After food with plenty of fluids' },
  { medicineName: 'Emeset 4mg (Ondansetron)', dose: '1 Tablet', timesPerDay: 2, timing: { morning: true, night: true }, duration: '3 days', instructions: '30 minutes before meals for nausea/vomiting' },
  { medicineName: 'Calcirol 60K (Cholecalciferol / Vitamin D3)', dose: '1 Sachet / Capsule', timesPerDay: 1, timing: { morning: true }, duration: '8 weeks', instructions: 'Once weekly with warm milk' },
  { medicineName: 'Becosules Z (Vitamin B-Complex + Zinc)', dose: '1 Capsule', timesPerDay: 1, timing: { morning: true }, duration: '15 days', instructions: 'After breakfast' },
  { medicineName: 'Electral ORS (Oral Rehydration Salts)', dose: '1 Sachet in 1L Water', timesPerDay: 3, timing: { morning: true, afternoon: true, night: true }, duration: '2 days', instructions: 'Drink frequently throughout the day' },
  { medicineName: 'Thyronorm 50mcg (Levothyroxine)', dose: '1 Tablet', timesPerDay: 1, timing: { morning: true }, duration: '30 days', instructions: 'Early morning empty stomach, 1 hr before tea/coffee' },
  { medicineName: 'Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)', dose: '1 Tablet', timesPerDay: 2, timing: { morning: true, night: true }, duration: '5 days', instructions: 'Strictly after meals' },
  { medicineName: 'Ascoril-LS Syrup (Ambroxol + Levosalbutamol + Guaiphenesin)', dose: '10ml', timesPerDay: 3, timing: { morning: true, afternoon: true, night: true }, duration: '5 days', instructions: 'After food with warm water' },
];
