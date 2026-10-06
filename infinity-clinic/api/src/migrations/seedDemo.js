/**
 * Full demo transactional data — patients, appointments (all statuses),
 * OPD tokens, consultations, prescriptions, pharmacy queue, payments,
 * clinical diagnostic services, templates, and audit logs.
 */

const DEMO_TAG = '__demo__';

const DEMO_PATIENTS = [
  { phone: '9100000001', full_name: 'Rahul Sharma', email: 'rahul.demo@example.com', date_of_birth: '1985-03-12', gender: 'Male', address: 'Plot 12, Sunrise Avenue, City Centre' },
  { phone: '9100000002', full_name: 'Priya Deshmukh', email: 'priya.demo@example.com', date_of_birth: '1992-07-22', gender: 'Female', address: 'Flat 402, Green Park Heights, City Centre' },
  { phone: '9100000003', full_name: 'Amit Patil', email: 'amit.demo@example.com', date_of_birth: '1978-11-05', gender: 'Male', address: 'B-14, Metro Enclave, City Centre' },
  { phone: '9100000004', full_name: 'Sunita More', email: 'sunita.demo@example.com', date_of_birth: '1990-01-18', gender: 'Female', address: 'House 88, Lakeview Colony, City Centre' },
  { phone: '9100000005', full_name: 'Vikram Kulkarni', email: 'vikram.demo@example.com', date_of_birth: '1982-09-30', gender: 'Male', address: 'Plot 55, Central Square, City Centre' },
  { phone: '9100000006', full_name: 'Anjali Rao', email: 'anjali.demo@example.com', date_of_birth: '1995-04-08', gender: 'Female', address: 'Flat 201, Royal Palms, City Centre' },
  { phone: '9100000007', full_name: 'Ramesh Verma', email: 'ramesh.demo@example.com', date_of_birth: '1970-12-25', gender: 'Male', address: 'Lane 4, Model Town, City Centre' },
  { phone: '9100000008', full_name: 'Kavita Joshi', email: 'kavita.demo@example.com', date_of_birth: '1988-06-14', gender: 'Female', address: 'Tower 3, Skyline Apartments, City Centre' },
  { phone: '9100000009', full_name: 'Suresh Naidu', email: 'suresh.demo@example.com', date_of_birth: '1975-02-03', gender: 'Male', address: 'Sector 8, Garden View, City Centre' },
  { phone: '9100000010', full_name: 'Meera Iyer', email: 'meera.demo@example.com', date_of_birth: '1998-10-19', gender: 'Female', address: 'Plot 71, Silver Oaks, City Centre' },
  { phone: '9100000011', full_name: 'Deepak Singh', email: 'deepak.demo@example.com', date_of_birth: '1983-08-07', gender: 'Male', address: 'B-7, Harmony Residency, City Centre' },
  { phone: '9100000012', full_name: 'Pooja Gupta', email: 'pooja.demo@example.com', date_of_birth: '1991-05-28', gender: 'Female', address: 'Flat 103, Lotus Towers, City Centre' },
  { phone: '9100000013', full_name: 'Harish Reddy', email: 'harish.demo@example.com', date_of_birth: '1968-03-15', gender: 'Male', address: 'Road No. 2, Emerald Park, City Centre' },
  { phone: '9100000014', full_name: 'Neha Chavan', email: 'neha.demo@example.com', date_of_birth: '1994-12-01', gender: 'Female', address: 'Block C, Golden Meadows, City Centre' },
  { phone: '9100000015', full_name: 'Sanjay Mehta', email: 'sanjay.demo@example.com', date_of_birth: '1980-07-09', gender: 'Male', address: 'Flat 502, Pearl Arcade, City Centre' },
];

const RX_ITEMS_CARDIO = [
  { medicine_name: 'Amlodipine 5mg', dose: '1 tablet', times_per_day: 1, timing_morning: true, duration: '30 days', instructions: 'After breakfast' },
  { medicine_name: 'Atorvastatin 10mg', dose: '1 tablet', times_per_day: 1, timing_night: true, duration: '30 days', instructions: 'At bedtime' },
  { medicine_name: 'Aspirin 75mg', dose: '1 tablet', times_per_day: 1, timing_afternoon: true, duration: '30 days', instructions: 'After lunch' },
];

const RX_ITEMS_ENT = [
  { medicine_name: 'Montelukast 10mg', dose: '1 tablet', times_per_day: 1, timing_night: true, duration: '14 days', instructions: 'At bedtime' },
  { medicine_name: 'Levocetirizine 5mg', dose: '1 tablet', times_per_day: 1, timing_evening: true, duration: '7 days', instructions: 'After food' },
];

const RX_ITEMS_ORTHO = [
  { medicine_name: 'Diclofenac 50mg', dose: '1 tablet', times_per_day: 2, timing_morning: true, timing_evening: true, duration: '5 days', instructions: 'After meals' },
  { medicine_name: 'Calcium + Vit D3', dose: '1 tablet', times_per_day: 1, timing_night: true, duration: '1 month', instructions: '' },
];

const RX_ITEMS_NEURO = [
  { medicine_name: 'Propranolol 40mg', dose: '1 tablet', times_per_day: 2, timing_morning: true, timing_evening: true, duration: '14 days', instructions: 'For migraine prophylaxis' },
];

const RX_ITEMS_GYNAE = [
  { medicine_name: 'Folic Acid 5mg', dose: '1 tablet', times_per_day: 1, timing_morning: true, duration: '3 months', instructions: '' },
  { medicine_name: 'Iron Supplement', dose: '1 tablet', times_per_day: 1, timing_night: true, duration: '2 months', instructions: 'After dinner' },
];

const CLINICAL_SERVICES_BANK = {
  cardiology: [
    [{ service_name: '12-Lead Digital ECG', price: 350 }, { service_name: 'Blood Sugar Test (Random / Fasting)', price: 100 }],
    [{ service_name: '2D-ECHO (Echocardiography)', price: 1800 }, { service_name: 'Lipid Profile', price: 650 }],
    [{ service_name: '12-Lead Digital ECG', price: 350 }, { service_name: 'Complete Blood Count (CBC) + ESR', price: 350 }],
    [{ service_name: 'Blood Pressure (BP) Monitoring', price: 50 }, { service_name: 'HbA1c (Glycated Haemoglobin)', price: 450 }],
    [{ service_name: '12-Lead Digital ECG', price: 350 }],
  ],
  ent: [
    [{ service_name: 'Pure Tone Audiometry (Hearing Test)', price: 700 }],
    [{ service_name: 'Video Endoscopy (ENT)', price: 1200 }, { service_name: 'Complete Blood Count (CBC) + ESR', price: 350 }],
    [{ service_name: 'Nebulization Therapy', price: 200 }],
  ],
  ortho: [
    [{ service_name: 'Digital X-Ray', price: 600 }, { service_name: 'Wound Dressing & Suturing', price: 300 }],
    [{ service_name: 'Digital X-Ray', price: 600 }],
    [{ service_name: 'Complete Blood Count (CBC) + ESR', price: 350 }],
  ],
  neuro: [
    [{ service_name: 'MRI Scan (Brain / Spine / Joints)', price: 5500 }, { service_name: 'Complete Blood Count (CBC) + ESR', price: 350 }],
    [{ service_name: 'Blood Pressure (BP) Monitoring', price: 50 }, { service_name: 'HbA1c (Glycated Haemoglobin)', price: 450 }],
  ],
  gynae: [
    [{ service_name: 'Ultrasound (USG Abdomen & Pelvis)', price: 1200 }, { service_name: 'Complete Blood Count (CBC) + ESR', price: 350 }],
    [{ service_name: 'Blood Sugar Test (Random / Fasting)', price: 100 }, { service_name: 'Lipid Profile', price: 650 }],
  ],
};

function formatFrequency(item) {
  const parts = [];
  if (item.timing_morning) parts.push('Morning');
  if (item.timing_afternoon) parts.push('Afternoon');
  if (item.timing_evening) parts.push('Evening');
  if (item.timing_night) parts.push('Night');
  if (item.times_per_day && parts.length) return `${item.times_per_day}× daily — ${parts.join(', ')}`;
  if (item.times_per_day) return `${item.times_per_day} times a day`;
  return parts.join(', ');
}

async function clearDemoData(pool) {
  const doctors = await getDoctorMap(pool);
  const doctorIds = Object.values(doctors).map((d) => d.id);

  if (doctorIds.length > 0) {
    const { rows: [{ today }] } = await pool.query(`SELECT CURRENT_DATE::text AS today`);
    await pool.query(`
      DELETE FROM prescription_items WHERE prescription_id IN (
        SELECT pr.id FROM prescriptions pr
        JOIN consultations c ON c.id = pr.consultation_id
        JOIN appointments a ON a.id = c.appointment_id
        WHERE a.doctor_id = ANY($1::uuid[]) AND a.appointment_date = $2
      )`, [doctorIds, today]);
    await pool.query(`
      DELETE FROM prescriptions WHERE consultation_id IN (
        SELECT c.id FROM consultations c
        JOIN appointments a ON a.id = c.appointment_id
        WHERE a.doctor_id = ANY($1::uuid[]) AND a.appointment_date = $2
      )`, [doctorIds, today]);
    await pool.query(`
      DELETE FROM consultations WHERE appointment_id IN (
        SELECT id FROM appointments WHERE doctor_id = ANY($1::uuid[]) AND appointment_date = $2
      )`, [doctorIds, today]);
    await pool.query(`
      DELETE FROM opd_tokens WHERE appointment_id IN (
        SELECT id FROM appointments WHERE doctor_id = ANY($1::uuid[]) AND appointment_date = $2
      )`, [doctorIds, today]);
    await pool.query(`
      DELETE FROM appointment_services WHERE appointment_id IN (
        SELECT id FROM appointments WHERE doctor_id = ANY($1::uuid[]) AND appointment_date = $2
      )`, [doctorIds, today]);
    await pool.query(`
      DELETE FROM payment_audit_logs WHERE appointment_id IN (
        SELECT id FROM appointments WHERE doctor_id = ANY($1::uuid[]) AND appointment_date = $2
      )`, [doctorIds, today]);
    await pool.query(`
      DELETE FROM payments WHERE appointment_id IN (
        SELECT id FROM appointments WHERE doctor_id = ANY($1::uuid[]) AND appointment_date = $2
      )`, [doctorIds, today]);
    await pool.query(
      `DELETE FROM appointments WHERE doctor_id = ANY($1::uuid[]) AND appointment_date = $2`,
      [doctorIds, today]
    );
    await pool.query(
      `DELETE FROM opd_token_counters WHERE doctor_id = ANY($1::uuid[]) AND visit_date = $2`,
      [doctorIds, today]
    );
  }

  const { rows: demoPatients } = await pool.query('SELECT id FROM patients WHERE phone LIKE $1', ['910000%']);
  const demoPatientIds = demoPatients.map((r) => r.id);
  const apptParams = [DEMO_TAG, demoPatientIds.length ? demoPatientIds : null];

  await pool.query(`
    DELETE FROM prescription_items WHERE prescription_id IN (
      SELECT pr.id FROM prescriptions pr
      JOIN consultations c ON c.id = pr.consultation_id
      JOIN appointments a ON a.id = c.appointment_id
      WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))
    )`, apptParams);
  await pool.query(`
    DELETE FROM prescriptions WHERE consultation_id IN (
      SELECT c.id FROM consultations c
      JOIN appointments a ON a.id = c.appointment_id
      WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))
    )`, apptParams);
  await pool.query(`
    DELETE FROM consultations WHERE appointment_id IN (
      SELECT a.id FROM appointments a
      WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))
    )`, apptParams);
  await pool.query(`
    DELETE FROM opd_tokens WHERE appointment_id IN (
      SELECT a.id FROM appointments a
      WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))
    )`, apptParams);
  await pool.query(`
    DELETE FROM appointment_services WHERE appointment_id IN (
      SELECT a.id FROM appointments a
      WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))
    )`, apptParams);
  await pool.query(`
    DELETE FROM payment_audit_logs WHERE appointment_id IN (
      SELECT a.id FROM appointments a
      WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))
    )`, apptParams);
  await pool.query(`
    DELETE FROM payments WHERE appointment_id IN (
      SELECT a.id FROM appointments a
      WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))
    )`, apptParams);
  await pool.query('DELETE FROM appointments a WHERE (a.notes = $1 OR ($2::uuid[] IS NOT NULL AND a.patient_id = ANY($2::uuid[])))', apptParams);
  await pool.query('DELETE FROM patients WHERE phone LIKE $1', ['910000%']);
  await pool.query(`DELETE FROM medicine_templates WHERE medicine_name LIKE '%(demo)%' OR medicine_name IN (
    'Amlodipine 5mg', 'Atorvastatin 10mg', 'Aspirin 75mg', 'Montelukast 10mg',
    'Levocetirizine 5mg', 'Diclofenac 50mg', 'Calcium + Vit D3', 'Propranolol 40mg',
    'Folic Acid 5mg', 'Iron Supplement', 'Paracetamol 650mg'
  )`);
  await pool.query(`DELETE FROM audit_log WHERE details->>'demo' = 'true'`);
}

async function getDoctorMap(pool) {
  const { rows } = await pool.query(
    `SELECT d.id, d.full_name, d.consultation_fee, u.email
     FROM doctors d JOIN users u ON u.id = d.user_id
     WHERE u.email IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      'doctor@pulseclinic.demo', 'nair@pulseclinic.demo', 'kapoor@pulseclinic.demo',
      'sen@pulseclinic.demo', 'roy@pulseclinic.demo',
      'doctor@infinityclinic.com', 'moon@infinityclinics.com', 'kolhe@infinityclinics.com',
      'khandait@infinityclinics.com', 'lodhi@infinityclinics.com',
    ]
  );
  return Object.fromEntries(rows.map((r) => [r.email, r]));
}

async function ensurePatient(pool, p) {
  const { rows } = await pool.query(
    `INSERT INTO patients (phone, full_name, email, date_of_birth, gender, address)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (phone) DO UPDATE SET
       full_name = EXCLUDED.full_name, email = EXCLUDED.email,
       date_of_birth = EXCLUDED.date_of_birth, gender = EXCLUDED.gender, address = EXCLUDED.address
     RETURNING id`,
    [p.phone, p.full_name, p.email, p.date_of_birth, p.gender, p.address]
  );
  return rows[0].id;
}

async function insertAppointment(pool, { patientId, doctorId, date, time, status, bookedVia }) {
  const { rows } = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, notes, booked_via)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [patientId, doctorId, date, time, status, DEMO_TAG, bookedVia || 'walk_in']
  );
  return rows[0].id;
}

async function insertToken(pool, { appointmentId, doctorId, visitDate, tokenNumber, status, calledAt, completedAt }) {
  await pool.query(
    `INSERT INTO opd_tokens (appointment_id, doctor_id, visit_date, token_number, status, called_at, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [appointmentId, doctorId, visitDate, tokenNumber, status, calledAt || null, completedAt || null]
  );
}

async function insertConsultation(pool, { appointmentId, doctorId, patientId, complaint, diagnosis, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO consultations (appointment_id, doctor_id, patient_id, chief_complaint, diagnosis, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [appointmentId, doctorId, patientId, complaint, diagnosis, notes]
  );
  return rows[0].id;
}

async function insertPrescription(pool, { consultationId, doctorId, patientId, advice, pharmacyStatus, items, pharmacistId }) {
  const isDispensed = pharmacyStatus === 'dispensed';
  const { rows } = await pool.query(
    `INSERT INTO prescriptions (consultation_id, doctor_id, patient_id, advice, pharmacy_status, dispensed_at, dispensed_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [consultationId, doctorId, patientId, advice, pharmacyStatus || 'pending', isDispensed ? new Date() : null, isDispensed ? pharmacistId : null]
  );
  const rxId = rows[0].id;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await pool.query(
      `INSERT INTO prescription_items (
         prescription_id, medicine_name, dosage, frequency, duration, instructions,
         dose, times_per_day, timing_morning, timing_afternoon, timing_evening, timing_night, sort_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        rxId, item.medicine_name, item.dose, formatFrequency(item), item.duration, item.instructions || null,
        item.dose, item.times_per_day || null,
        !!item.timing_morning, !!item.timing_afternoon, !!item.timing_evening, !!item.timing_night, i,
      ]
    );
  }
  return rxId;
}

async function insertPayment(pool, { appointmentId, amount, method, status, recordedBy, transactionRef, notes, paidAt, services = [] }) {
  let totalAmount = Number(amount) || 0;

  // Insert services
  if (Array.isArray(services) && services.length > 0) {
    for (const s of services) {
      const linePrice = Number(s.price) || 0;
      const qty = Number(s.quantity) || 1;
      totalAmount += linePrice * qty;
      await pool.query(
        `INSERT INTO appointment_services (appointment_id, service_id, service_name, price, quantity, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [appointmentId, s.service_id || null, s.service_name, linePrice, qty, s.notes || null]
      );
    }
  }

  const actualPaidAt = status === 'completed' ? (paidAt || new Date()) : null;
  const { rows } = await pool.query(
    `INSERT INTO payments (appointment_id, amount, method, transaction_ref, notes, status, audit_status, recorded_by, paid_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'verified', $7, $8)
     RETURNING id`,
    [appointmentId, totalAmount, method, transactionRef || null, notes || null, status, recordedBy, actualPaidAt]
  );

  const paymentId = rows[0]?.id;

  if (paymentId && status === 'completed') {
    await pool.query(
      `INSERT INTO payment_audit_logs (payment_id, appointment_id, action, performed_by, new_values, notes, created_at)
       VALUES ($1, $2, 'RECORDED', $3, $4, $5, $6)`,
      [
        paymentId,
        appointmentId,
        recordedBy,
        JSON.stringify({
          amount: totalAmount,
          method,
          transaction_ref: transactionRef || null,
          services,
        }),
        notes || 'Payment recorded at reception desk',
        actualPaidAt || new Date(),
      ]
    );
  }
}

async function seedMedicineTemplates(pool, doctorId, items) {
  for (const item of items) {
    await pool.query(
      `INSERT INTO medicine_templates (
         doctor_id, medicine_name, dose, times_per_day,
         timing_morning, timing_afternoon, timing_evening, timing_night,
         duration, instructions, use_count, last_used_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,5,NOW())
       ON CONFLICT (doctor_id, medicine_name) DO UPDATE SET
         dose = EXCLUDED.dose, times_per_day = EXCLUDED.times_per_day,
         timing_morning = EXCLUDED.timing_morning, timing_afternoon = EXCLUDED.timing_afternoon,
         timing_evening = EXCLUDED.timing_evening, timing_night = EXCLUDED.timing_night,
         duration = EXCLUDED.duration, instructions = EXCLUDED.instructions,
         use_count = medicine_templates.use_count + 1, last_used_at = NOW()`,
      [
        doctorId, item.medicine_name, item.dose, item.times_per_day || null,
        !!item.timing_morning, !!item.timing_afternoon, !!item.timing_evening, !!item.timing_night,
        item.duration, item.instructions || null,
      ]
    );
  }
}

function localISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localISODate(d);
}

function daysAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return localISODate(d);
}

async function setTokenCounter(pool, doctorId, visitDate, lastToken) {
  await pool.query(
    `INSERT INTO opd_token_counters (doctor_id, visit_date, last_token) VALUES ($1, $2, $3)
     ON CONFLICT (doctor_id, visit_date) DO UPDATE SET last_token = $3`,
    [doctorId, visitDate, lastToken]
  );
}

export async function seedDemoData(pool) {
  console.log('Seeding demo transactional data with attached services...');
  await clearDemoData(pool);

  const doctors = await getDoctorMap(pool);
  const sharma = doctors['doctor@pulseclinic.demo'] || doctors['doctor@infinityclinic.com'];
  const nair = doctors['nair@pulseclinic.demo'] || doctors['moon@infinityclinics.com'];
  const kapoor = doctors['kapoor@pulseclinic.demo'] || doctors['kolhe@infinityclinics.com'];
  const sen = doctors['sen@pulseclinic.demo'] || doctors['khandait@infinityclinics.com'];
  const roy = doctors['roy@pulseclinic.demo'] || doctors['lodhi@infinityclinics.com'];

  if (!sharma) {
    console.warn('Demo seed skipped: doctors not found. Run base seed first.');
    return;
  }

  const { rows: adminRows } = await pool.query(
    `SELECT id FROM users WHERE email IN ('admin@pulseclinic.demo', 'admin@infinityclinic.com') LIMIT 1`
  );
  const adminId = adminRows[0]?.id;

  const { rows: recRows } = await pool.query(
    `SELECT u.id FROM users u WHERE u.role = 'receptionist' LIMIT 1`
  );
  const receptionistId = recRows[0]?.id || adminId;

  const { rows: pharmRows } = await pool.query(
    `SELECT p.id FROM pharmacists p JOIN users u ON u.id = p.user_id WHERE u.email IN ('pharmacy@pulseclinic.demo', 'pharmacy@infinityclinic.com') LIMIT 1`
  );
  const pharmacistId = pharmRows[0]?.id;

  const patientIds = {};
  for (const p of DEMO_PATIENTS) {
    patientIds[p.phone] = await ensurePatient(pool, p);
  }

  const { rows: [{ today }] } = await pool.query(`SELECT CURRENT_DATE::text AS today`);
  const p = (phone) => patientIds[phone];

  // ── Medicine templates ──
  await seedMedicineTemplates(pool, sharma.id, RX_ITEMS_CARDIO);
  await seedMedicineTemplates(pool, sharma.id, [{ medicine_name: 'Paracetamol 650mg', dose: '1 tablet', times_per_day: 3, timing_morning: true, timing_afternoon: true, timing_evening: true, duration: '5 days', instructions: 'After food' }]);
  if (nair) await seedMedicineTemplates(pool, nair.id, RX_ITEMS_ENT);
  if (kapoor) await seedMedicineTemplates(pool, kapoor.id, RX_ITEMS_ORTHO);
  if (sen) await seedMedicineTemplates(pool, sen.id, RX_ITEMS_NEURO);
  if (roy) await seedMedicineTemplates(pool, roy.id, RX_ITEMS_GYNAE);

  // ── TODAY — Dr Sharma queue (full OPD workflow + services) ──
  const scenarios = [
    { phone: '9100000001', time: '09:00', apptStatus: 'completed', tokenStatus: 'completed', token: 1,
      complaint: 'Chest tightness on exertion', diagnosis: 'Stable angina — on medical management',
      rx: RX_ITEMS_CARDIO, pharmacyStatus: 'dispensed',
      payment: {
        method: 'cash', status: 'completed', recordedBy: receptionistId,
        transactionRef: 'Paid cash at counter (500x2 + 200x1)',
        notes: 'ECG conducted in Room 1',
        services: [{ service_name: '12-Lead Digital ECG', price: 350 }, { service_name: 'Blood Sugar Test (Random / Fasting)', price: 100 }],
      }
    },
    { phone: '9100000002', time: '09:15', apptStatus: 'completed', tokenStatus: 'completed', token: 2,
      complaint: 'Palpitations, anxiety', diagnosis: 'Benign PVCs — reassured',
      rx: RX_ITEMS_CARDIO.slice(0, 2), pharmacyStatus: 'pending',
      payment: {
        method: 'upi_offline', status: 'completed', recordedBy: receptionistId,
        transactionRef: '423981029384',
        notes: '2D-Echo conducted by Dr Sharma',
        services: [{ service_name: '2D-ECHO (Echocardiography)', price: 1800 }, { service_name: 'Lipid Profile', price: 650 }],
      }
    },
    { phone: '9100000003', time: '09:30', apptStatus: 'in_consultation', tokenStatus: 'in_consultation', token: 3,
      complaint: 'Hypertension follow-up', diagnosis: 'Essential hypertension',
      rx: RX_ITEMS_CARDIO.slice(0, 1), pharmacyStatus: 'draft', payment: null },
    { phone: '9100000004', time: '09:45', apptStatus: 'checked_in', tokenStatus: 'called', token: 4,
      complaint: null, diagnosis: null, rx: null, payment: null },
    { phone: '9100000005', time: '10:00', apptStatus: 'checked_in', tokenStatus: 'waiting', token: 5,
      complaint: null, diagnosis: null, rx: null, payment: null },
    { phone: '9100000006', time: '10:15', apptStatus: 'checked_in', tokenStatus: 'skipped', token: 6,
      complaint: null, diagnosis: null, rx: null, payment: null },
    { phone: '9100000007', time: '10:30', apptStatus: 'checked_in', tokenStatus: 'waiting', token: 7,
      bookedVia: 'phone', complaint: null, rx: null, payment: null },
    { phone: '9100000008', time: '11:00', apptStatus: 'checked_in', tokenStatus: 'waiting', token: 8,
      bookedVia: 'website', complaint: null, rx: null, payment: null },
    { phone: '9100000009', time: '11:30', apptStatus: 'cancelled', tokenStatus: null, token: null,
      bookedVia: 'website', complaint: null, rx: null, payment: null },
    { phone: '9100000010', time: '12:00', apptStatus: 'no_show', tokenStatus: null, token: null,
      bookedVia: 'phone', complaint: null, rx: null, payment: null },
  ];

  let maxToken = 0;
  for (const s of scenarios) {
    const apptId = await insertAppointment(pool, {
      patientId: p(s.phone), doctorId: sharma.id, date: today, time: s.time,
      status: s.apptStatus, bookedVia: s.bookedVia || 'walk_in',
    });

    if (s.token) {
      maxToken = Math.max(maxToken, s.token);
      await insertToken(pool, {
        appointmentId: apptId, doctorId: sharma.id, visitDate: today,
        tokenNumber: s.token, status: s.tokenStatus,
        calledAt: ['called', 'in_consultation', 'completed', 'skipped'].includes(s.tokenStatus) ? new Date() : null,
        completedAt: s.tokenStatus === 'completed' ? new Date() : null,
      });
    }

    if (s.complaint) {
      const consultId = await insertConsultation(pool, {
        appointmentId: apptId, doctorId: sharma.id, patientId: p(s.phone),
        complaint: s.complaint, diagnosis: s.diagnosis, notes: 'Demo consultation notes.',
      });
      if (s.rx?.length) {
        await insertPrescription(pool, {
          consultationId: consultId, doctorId: sharma.id, patientId: p(s.phone),
          advice: 'Low salt diet. Regular walking 30 min daily. Follow up in 2 weeks.',
          pharmacyStatus: s.pharmacyStatus, items: s.rx, pharmacistId,
        });
      }
    }

    if (s.payment) {
      await insertPayment(pool, {
        appointmentId: apptId, amount: sharma.consultation_fee,
        method: s.payment.method, status: s.payment.status, recordedBy: s.payment.recordedBy || adminId,
        transactionRef: s.payment.transactionRef, notes: s.payment.notes, services: s.payment.services || [],
      });
    }
  }

  await setTokenCounter(pool, sharma.id, today, maxToken);

  // ── TODAY — other doctors (appointments + live queue tokens + services) ──
  const otherToday = [
    nair && {
      doctor: nair, phone: '9100000011', time: '10:00', apptStatus: 'completed', token: 1, tokenStatus: 'completed',
      bookedVia: 'walk_in', complaint: 'Chronic sinusitis', diagnosis: 'Allergic rhinitis with sinusitis',
      notes: 'Advised steam inhalation.', rx: RX_ITEMS_ENT, pharmacyStatus: 'pending',
      payment: {
        method: 'card_offline', status: 'completed', recordedBy: receptionistId,
        transactionRef: 'Card ending 4582 / Slip #8912',
        notes: 'Video endoscopy completed',
        services: [{ service_name: 'Video Endoscopy (ENT)', price: 1200 }, { service_name: 'Pure Tone Audiometry (Hearing Test)', price: 700 }],
      },
    },
    nair && {
      doctor: nair, phone: '9100000002', time: '10:20', apptStatus: 'in_consultation', token: 2, tokenStatus: 'in_consultation',
      bookedVia: 'phone', complaint: 'Nasal blockage', diagnosis: 'Deviated septum — conservative', notes: 'Demo ENT consult.',
    },
    nair && {
      doctor: nair, phone: '9100000004', time: '10:40', apptStatus: 'checked_in', token: 3, tokenStatus: 'waiting',
      bookedVia: 'website',
    },
    nair && {
      doctor: nair, phone: '9100000014', time: '11:00', apptStatus: 'checked_in', token: 4, tokenStatus: 'waiting',
      bookedVia: 'walk_in',
    },
    kapoor && {
      doctor: kapoor, phone: '9100000012', time: '11:00', apptStatus: 'checked_in', token: 1, tokenStatus: 'called',
      bookedVia: 'website',
    },
    kapoor && {
      doctor: kapoor, phone: '9100000005', time: '11:20', apptStatus: 'checked_in', token: 2, tokenStatus: 'waiting',
      bookedVia: 'phone',
    },
    kapoor && {
      doctor: kapoor, phone: '9100000009', time: '11:40', apptStatus: 'checked_in', token: 3, tokenStatus: 'waiting',
      bookedVia: 'walk_in',
    },
    roy && {
      doctor: roy, phone: '9100000013', time: '17:00', apptStatus: 'checked_in', token: 1, tokenStatus: 'waiting',
      bookedVia: 'phone',
    },
    roy && {
      doctor: roy, phone: '9100000006', time: '17:20', apptStatus: 'checked_in', token: 2, tokenStatus: 'waiting',
      bookedVia: 'website',
    },
    sen && {
      doctor: sen, phone: '9100000007', time: '19:00', apptStatus: 'in_consultation', token: 1, tokenStatus: 'in_consultation',
      bookedVia: 'walk_in', complaint: 'Migraine follow-up', diagnosis: 'Migraine without aura', notes: 'Demo neuro consult.',
    },
    sen && {
      doctor: sen, phone: '9100000015', time: '19:20', apptStatus: 'checked_in', token: 2, tokenStatus: 'waiting',
      bookedVia: 'phone',
    },
  ].filter(Boolean);

  const otherMaxToken = {};
  for (const s of otherToday) {
    const apptId = await insertAppointment(pool, {
      patientId: p(s.phone), doctorId: s.doctor.id, date: today, time: s.time,
      status: s.apptStatus, bookedVia: s.bookedVia || 'walk_in',
    });

    if (s.token) {
      otherMaxToken[s.doctor.id] = Math.max(otherMaxToken[s.doctor.id] || 0, s.token);
      await insertToken(pool, {
        appointmentId: apptId, doctorId: s.doctor.id, visitDate: today,
        tokenNumber: s.token, status: s.tokenStatus,
        calledAt: ['called', 'in_consultation', 'completed', 'skipped'].includes(s.tokenStatus) ? new Date() : null,
        completedAt: s.tokenStatus === 'completed' ? new Date() : null,
      });
    }

    if (s.complaint) {
      const consultId = await insertConsultation(pool, {
        appointmentId: apptId, doctorId: s.doctor.id, patientId: p(s.phone),
        complaint: s.complaint, diagnosis: s.diagnosis, notes: s.notes || 'Demo consultation notes.',
      });
      if (s.rx?.length) {
        await insertPrescription(pool, {
          consultationId: consultId, doctorId: s.doctor.id, patientId: p(s.phone),
          advice: s.advice || 'Follow up as advised.',
          pharmacyStatus: s.pharmacyStatus, items: s.rx, pharmacistId,
        });
      }
    }

    if (s.payment) {
      await insertPayment(pool, {
        appointmentId: apptId, amount: s.doctor.consultation_fee,
        method: s.payment.method, status: s.payment.status, recordedBy: s.payment.recordedBy || adminId,
        transactionRef: s.payment.transactionRef, notes: s.payment.notes, services: s.payment.services || [],
      });
    }
  }

  for (const [doctorId, lastToken] of Object.entries(otherMaxToken)) {
    await setTokenCounter(pool, doctorId, today, lastToken);
  }

  // ── FUTURE appointments ──
  await insertAppointment(pool, {
    patientId: p('9100000014'), doctorId: sharma.id, date: daysAhead(1), time: '09:00',
    status: 'confirmed', bookedVia: 'website',
  });
  await insertAppointment(pool, {
    patientId: p('9100000015'), doctorId: sharma.id, date: daysAhead(3), time: '10:30',
    status: 'pending', bookedVia: 'website',
  });
  if (nair) {
    await insertAppointment(pool, {
      patientId: p('9100000001'), doctorId: nair.id, date: daysAhead(2), time: '11:00',
      status: 'confirmed', bookedVia: 'phone',
    });
  }

  // ── 15-day rolling history + upcoming bookings (one per doctor per day) ──
  const doctorList = [sharma, nair, kapoor, sen, roy].filter(Boolean);
  const caseBank = {
    [sharma?.id]: [
      { complaint: 'Chest tightness on exertion', diagnosis: 'Stable angina — on medical management', rx: RX_ITEMS_CARDIO, spec: 'cardiology' },
      { complaint: 'Palpitations', diagnosis: 'Benign PVCs — reassured', rx: RX_ITEMS_CARDIO.slice(0, 2), spec: 'cardiology' },
      { complaint: 'Hypertension follow-up', diagnosis: 'Essential hypertension — controlled', rx: RX_ITEMS_CARDIO.slice(0, 1), spec: 'cardiology' },
      { complaint: 'Breathlessness on exertion', diagnosis: 'Mild LV dysfunction — stable', rx: RX_ITEMS_CARDIO, spec: 'cardiology' },
    ],
    [nair?.id]: [
      { complaint: 'Chronic sinusitis', diagnosis: 'Allergic rhinitis with sinusitis', rx: RX_ITEMS_ENT, spec: 'ent' },
      { complaint: 'Ear pain', diagnosis: 'Otitis media — resolving', rx: RX_ITEMS_ENT, spec: 'ent' },
      { complaint: 'Nasal blockage', diagnosis: 'Deviated septum — conservative', rx: RX_ITEMS_ENT.slice(0, 1), spec: 'ent' },
    ],
    [kapoor?.id]: [
      { complaint: 'Knee pain', diagnosis: 'OA knee bilateral', rx: RX_ITEMS_ORTHO, spec: 'ortho' },
      { complaint: 'Lower back pain', diagnosis: 'Lumbar spondylosis', rx: RX_ITEMS_ORTHO, spec: 'ortho' },
      { complaint: 'Shoulder stiffness', diagnosis: 'Frozen shoulder — improving', rx: RX_ITEMS_ORTHO.slice(0, 1), spec: 'ortho' },
    ],
    [sen?.id]: [
      { complaint: 'Migraine', diagnosis: 'Migraine without aura', rx: RX_ITEMS_NEURO, spec: 'neuro' },
      { complaint: 'Recurrent headache', diagnosis: 'Tension-type headache', rx: RX_ITEMS_NEURO, spec: 'neuro' },
    ],
    [roy?.id]: [
      { complaint: 'Antenatal visit', diagnosis: 'Routine antenatal check-up', rx: RX_ITEMS_GYNAE, spec: 'gynae' },
      { complaint: 'Irregular periods', diagnosis: 'PCOS — on management', rx: RX_ITEMS_GYNAE.slice(0, 1), spec: 'gynae' },
    ],
  };

  const pastTimes = ['08:00', '08:15', '08:30', '08:45', '08:59'];
  const futureTimes = ['15:00', '15:15', '15:30', '15:45', '16:00'];
  const paymentMethods = ['cash', 'upi_offline', 'card_offline', 'net_banking', 'insurance'];
  const upiRefs = ['423981029384', '439281029112', 'UPI-HDFC-89123', '412093849102', 'UPI-SBI-77239', '440192837482'];
  const cardRefs = ['Card ending 4582 / Slip #8912', 'Card ending 9012 / Auth #4412', 'Card ending 1120 / Slip #3301', 'Card ending 8841 / Auth #9812'];

  let rollingCount = { past: 0, future: 0, servicesCount: 0 };

  for (let dayOffset = 1; dayOffset <= 15; dayOffset++) {
    const pastDate = daysAgo(dayOffset);
    const futureDate = daysAhead(dayOffset);

    for (let di = 0; di < doctorList.length; di++) {
      const doctor = doctorList[di];
      const cases = caseBank[doctor.id];
      const phone = DEMO_PATIENTS[(dayOffset + di) % DEMO_PATIENTS.length].phone;

      // Past: completed visit with consultation, prescription, services & payment
      const kase = cases[(dayOffset + di) % cases.length];
      const pastApptId = await insertAppointment(pool, {
        patientId: p(phone), doctorId: doctor.id, date: pastDate, time: pastTimes[di],
        status: 'completed', bookedVia: 'walk_in',
      });
      await insertToken(pool, {
        appointmentId: pastApptId, doctorId: doctor.id, visitDate: pastDate,
        tokenNumber: 1, status: 'completed', completedAt: new Date(pastDate),
      });
      const pastConsultId = await insertConsultation(pool, {
        appointmentId: pastApptId, doctorId: doctor.id, patientId: p(phone),
        complaint: kase.complaint, diagnosis: kase.diagnosis, notes: 'Demo history visit.',
      });
      await insertPrescription(pool, {
        consultationId: pastConsultId, doctorId: doctor.id, patientId: p(phone),
        advice: 'Follow up as needed.', pharmacyStatus: 'dispensed', items: kase.rx, pharmacistId,
      });

      // Attach realistic diagnostic services to visits
      const servicePool = CLINICAL_SERVICES_BANK[kase.spec] || CLINICAL_SERVICES_BANK.cardiology;
      const attachedServices = (dayOffset + di) % 4 !== 0 ? servicePool[(dayOffset + di) % servicePool.length] : [];

      const method = paymentMethods[(dayOffset + di) % paymentMethods.length];
      const cashierId = (dayOffset + di) % 2 === 0 ? receptionistId : adminId;

      let txnRef = null;
      if (method === 'upi_offline') txnRef = upiRefs[(dayOffset + di) % upiRefs.length];
      else if (method === 'card_offline') txnRef = cardRefs[(dayOffset + di) % cardRefs.length];
      else if (method === 'insurance') txnRef = `TPA-CLAIM-${890000 + dayOffset * 10 + di}`;
      else if (method === 'net_banking') txnRef = `IMPS-${900000 + dayOffset * 100 + di}`;
      else txnRef = 'Cash collected at reception counter';

      await insertPayment(pool, {
        appointmentId: pastApptId,
        amount: doctor.consultation_fee,
        method,
        status: 'completed',
        recordedBy: cashierId,
        transactionRef: txnRef,
        notes: attachedServices.length ? `Included ${attachedServices.map(s => s.service_name).join(', ')}` : 'Standard consultation fee',
        paidAt: new Date(pastDate),
        services: attachedServices,
      });

      if (attachedServices.length) rollingCount.servicesCount += attachedServices.length;
      await setTokenCounter(pool, doctor.id, pastDate, 1);
      rollingCount.past++;

      // Future: upcoming booking, not yet consulted
      const futurePhone = DEMO_PATIENTS[(dayOffset + di + 1) % DEMO_PATIENTS.length].phone;
      await insertAppointment(pool, {
        patientId: p(futurePhone), doctorId: doctor.id, date: futureDate, time: futureTimes[di],
        status: dayOffset % 5 === 0 ? 'pending' : 'confirmed',
        bookedVia: ['website', 'phone', 'walk_in'][(dayOffset + di) % 3],
      });
      rollingCount.future++;
    }
  }

  // ── Pending payment demo ──
  const pendingPayAppt = await insertAppointment(pool, {
    patientId: p('9100000008'), doctorId: sharma.id, date: daysAgo(1), time: '16:00',
    status: 'completed', bookedVia: 'walk_in',
  });
  await insertPayment(pool, {
    appointmentId: pendingPayAppt,
    amount: sharma.consultation_fee,
    method: 'cash',
    status: 'pending',
    recordedBy: null,
    services: [{ service_name: 'Blood Sugar Test (Random / Fasting)', price: 100 }],
  });

  // ── Audit log samples ──
  if (adminId) {
    const auditEntries = [
      { action: 'login', entity_type: 'user', details: { demo: 'true', note: 'Admin login' } },
      { action: 'appointment.check_in', entity_type: 'appointment', details: { demo: 'true', note: 'Patient checked in' } },
      { action: 'consultation.complete', entity_type: 'consultation', details: { demo: 'true', note: 'Visit completed' } },
      { action: 'prescription.dispense', entity_type: 'prescription', details: { demo: 'true', note: 'Medicines dispensed' } },
      { action: 'payment.record', entity_type: 'payment', details: { demo: 'true', note: 'Cash payment recorded' } },
    ];
    for (const e of auditEntries) {
      await pool.query(
        `INSERT INTO audit_log (user_id, action, entity_type, details) VALUES ($1, $2, $3, $4)`,
        [adminId, e.action, e.entity_type, JSON.stringify(e.details)]
      );
    }
  }

  console.log('Demo data seeded:');
  console.log(`  • ${DEMO_PATIENTS.length} patients (phones 9100000001–9100000015)`);
  console.log(`  • Today: every active appointment is also in the OPD queue`);
  console.log(`  • Attached clinical diagnostic tests & services to appointments (${rollingCount.servicesCount} services attached)`);
  console.log(`  • Payments seeded across Cash, UPI (with UTRs), Cards (with Auth codes), Net Banking, and Insurance`);
  console.log(`  • ${rollingCount.past} completed visits over the last 15 days, ${rollingCount.future} upcoming bookings`);
}
