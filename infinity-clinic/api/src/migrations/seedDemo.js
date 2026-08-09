/**
 * Full demo transactional data — patients, appointments (all statuses),
 * OPD tokens, consultations, prescriptions, pharmacy queue, payments, templates.
 */

const DEMO_TAG = '__demo__';

const DEMO_PATIENTS = [
  { phone: '9100000001', full_name: 'Rahul Sharma', email: 'rahul.demo@example.com', date_of_birth: '1985-03-12', gender: 'Male', address: 'Omkar Nagar, Nagpur' },
  { phone: '9100000002', full_name: 'Priya Deshmukh', email: 'priya.demo@example.com', date_of_birth: '1992-07-22', gender: 'Female', address: 'Manewada, Nagpur' },
  { phone: '9100000003', full_name: 'Amit Patil', email: 'amit.demo@example.com', date_of_birth: '1978-11-05', gender: 'Male', address: 'Dharampeth, Nagpur' },
  { phone: '9100000004', full_name: 'Sunita More', email: 'sunita.demo@example.com', date_of_birth: '1990-01-18', gender: 'Female', address: 'Sadar, Nagpur' },
  { phone: '9100000005', full_name: 'Vikram Kulkarni', email: 'vikram.demo@example.com', date_of_birth: '1982-09-30', gender: 'Male', address: 'Civil Lines, Nagpur' },
  { phone: '9100000006', full_name: 'Anjali Rao', email: 'anjali.demo@example.com', date_of_birth: '1995-04-08', gender: 'Female', address: 'Hingna, Nagpur' },
  { phone: '9100000007', full_name: 'Ramesh Verma', email: 'ramesh.demo@example.com', date_of_birth: '1970-12-25', gender: 'Male', address: 'Koradi, Nagpur' },
  { phone: '9100000008', full_name: 'Kavita Joshi', email: 'kavita.demo@example.com', date_of_birth: '1988-06-14', gender: 'Female', address: 'Wardha Road, Nagpur' },
  { phone: '9100000009', full_name: 'Suresh Naidu', email: 'suresh.demo@example.com', date_of_birth: '1975-02-03', gender: 'Male', address: 'Kamptee, Nagpur' },
  { phone: '9100000010', full_name: 'Meera Iyer', email: 'meera.demo@example.com', date_of_birth: '1998-10-19', gender: 'Female', address: 'Besa, Nagpur' },
  { phone: '9100000011', full_name: 'Deepak Singh', email: 'deepak.demo@example.com', date_of_birth: '1983-08-07', gender: 'Male', address: 'Trimurti Nagar, Nagpur' },
  { phone: '9100000012', full_name: 'Pooja Gupta', email: 'pooja.demo@example.com', date_of_birth: '1991-05-28', gender: 'Female', address: 'Sitabuldi, Nagpur' },
  { phone: '9100000013', full_name: 'Harish Reddy', email: 'harish.demo@example.com', date_of_birth: '1968-03-15', gender: 'Male', address: 'Ramdaspeth, Nagpur' },
  { phone: '9100000014', full_name: 'Neha Chavan', email: 'neha.demo@example.com', date_of_birth: '1994-12-01', gender: 'Female', address: 'Ambazari, Nagpur' },
  { phone: '9100000015', full_name: 'Sanjay Mehta', email: 'sanjay.demo@example.com', date_of_birth: '1980-07-09', gender: 'Male', address: 'Laxmi Nagar, Nagpur' },
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
    const today = new Date().toISOString().slice(0, 10);
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

  const { rows: demoPatients } = await pool.query(`SELECT id FROM patients WHERE phone LIKE '910000%'`);
  const demoPatientIds = demoPatients.map((r) => r.id);

  const apptFilter = demoPatientIds.length
    ? `(a.notes = $1 OR a.patient_id = ANY($2::uuid[]))`
    : `a.notes = $1`;
  const apptParams = demoPatientIds.length ? [DEMO_TAG, demoPatientIds] : [DEMO_TAG];

  await pool.query(`
    DELETE FROM prescription_items WHERE prescription_id IN (
      SELECT pr.id FROM prescriptions pr
      JOIN consultations c ON c.id = pr.consultation_id
      JOIN appointments a ON a.id = c.appointment_id
      WHERE ${apptFilter}
    )`, apptParams);
  await pool.query(`
    DELETE FROM prescriptions WHERE consultation_id IN (
      SELECT c.id FROM consultations c
      JOIN appointments a ON a.id = c.appointment_id
      WHERE ${apptFilter}
    )`, apptParams);
  await pool.query(`
    DELETE FROM consultations WHERE appointment_id IN (
      SELECT a.id FROM appointments a WHERE ${apptFilter}
    )`, apptParams);
  await pool.query(`
    DELETE FROM opd_tokens WHERE appointment_id IN (
      SELECT a.id FROM appointments a WHERE ${apptFilter}
    )`, apptParams);
  await pool.query(`
    DELETE FROM payments WHERE appointment_id IN (
      SELECT a.id FROM appointments a WHERE ${apptFilter}
    )`, apptParams);
  await pool.query(`DELETE FROM appointments a WHERE ${apptFilter}`, apptParams);
  await pool.query(`DELETE FROM patients WHERE phone LIKE '910000%'`);
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
     WHERE u.email IN ($1, $2, $3, $4, $5)`,
    [
      'doctor@infinityclinic.com',
      'moon@infinityclinics.com',
      'kolhe@infinityclinics.com',
      'khandait@infinityclinics.com',
      'lodhi@infinityclinics.com',
    ]
  );
  const map = {};
  for (const r of rows) map[r.email] = r;
  return map;
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

async function insertAppointment(pool, { patientId, doctorId, date, time, status, bookedVia, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, booked_via, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [patientId, doctorId, date, time, status, bookedVia, notes || DEMO_TAG]
  );
  return rows[0].id;
}

async function insertToken(pool, { appointmentId, doctorId, visitDate, tokenNumber, status, calledAt, completedAt }) {
  const { rows } = await pool.query(
    `INSERT INTO opd_tokens (appointment_id, doctor_id, visit_date, token_number, status, called_at, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [appointmentId, doctorId, visitDate, tokenNumber, status, calledAt || null, completedAt || null]
  );
  return rows[0].id;
}

async function insertConsultation(pool, { appointmentId, doctorId, patientId, complaint, diagnosis, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO consultations (appointment_id, doctor_id, patient_id, chief_complaint, diagnosis, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [appointmentId, doctorId, patientId, complaint, diagnosis, notes]
  );
  return rows[0].id;
}

async function insertPrescription(pool, {
  consultationId, doctorId, patientId, advice, pharmacyStatus, items, pharmacistId,
}) {
  const { rows } = await pool.query(
    `INSERT INTO prescriptions (consultation_id, doctor_id, patient_id, advice, pharmacy_status, dispensed_at, dispensed_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      consultationId, doctorId, patientId, advice, pharmacyStatus,
      pharmacyStatus === 'dispensed' ? new Date() : null,
      pharmacyStatus === 'dispensed' ? pharmacistId : null,
    ]
  );
  const rxId = rows[0].id;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await pool.query(
      `INSERT INTO prescription_items (
         prescription_id, medicine_name, dosage, frequency, duration, instructions,
         dose, times_per_day, timing_morning, timing_afternoon, timing_evening, timing_night, sort_order
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        rxId, item.medicine_name, item.dose, formatFrequency(item), item.duration, item.instructions || null,
        item.dose, item.times_per_day || null,
        !!item.timing_morning, !!item.timing_afternoon, !!item.timing_evening, !!item.timing_night, i,
      ]
    );
  }
  return rxId;
}

async function insertPayment(pool, { appointmentId, amount, method, status, recordedBy }) {
  await pool.query(
    `INSERT INTO payments (appointment_id, amount, method, status, recorded_by, paid_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [appointmentId, amount, method, status, recordedBy, status === 'completed' ? new Date() : null]
  );
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

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function seedDemoData(pool) {
  console.log('Seeding demo transactional data...');
  await clearDemoData(pool);

  const doctors = await getDoctorMap(pool);
  const maske = doctors['doctor@infinityclinic.com'];
  const moon = doctors['moon@infinityclinics.com'];
  const kolhe = doctors['kolhe@infinityclinics.com'];
  const khandait = doctors['khandait@infinityclinics.com'];
  const lodhi = doctors['lodhi@infinityclinics.com'];

  if (!maske) {
    console.warn('Demo seed skipped: doctors not found. Run base seed first.');
    return;
  }

  const { rows: adminRows } = await pool.query(`SELECT id FROM users WHERE email = 'admin@infinityclinic.com'`);
  const adminId = adminRows[0]?.id;
  const { rows: pharmRows } = await pool.query(
    `SELECT p.id FROM pharmacists p JOIN users u ON u.id = p.user_id WHERE u.email = 'pharmacy@infinityclinic.com'`
  );
  const pharmacistId = pharmRows[0]?.id;

  const patientIds = {};
  for (const p of DEMO_PATIENTS) {
    patientIds[p.phone] = await ensurePatient(pool, p);
  }

  const today = new Date().toISOString().slice(0, 10);
  const p = (phone) => patientIds[phone];

  // ── Medicine templates (doctor saved medicines) ──
  await seedMedicineTemplates(pool, maske.id, RX_ITEMS_CARDIO);
  await seedMedicineTemplates(pool, maske.id, [{ medicine_name: 'Paracetamol 650mg', dose: '1 tablet', times_per_day: 3, timing_morning: true, timing_afternoon: true, timing_evening: true, duration: '5 days', instructions: 'After food' }]);
  if (moon) await seedMedicineTemplates(pool, moon.id, RX_ITEMS_ENT);
  if (kolhe) await seedMedicineTemplates(pool, kolhe.id, RX_ITEMS_ORTHO);
  if (khandait) await seedMedicineTemplates(pool, khandait.id, RX_ITEMS_NEURO);
  if (lodhi) await seedMedicineTemplates(pool, lodhi.id, RX_ITEMS_GYNAE);

  // ── TODAY — Dr Maske queue (full OPD workflow) ──
  const scenarios = [
    { phone: '9100000001', time: '09:00', apptStatus: 'completed', tokenStatus: 'completed', token: 1,
      complaint: 'Chest tightness on exertion', diagnosis: 'Stable angina — on medical management',
      rx: RX_ITEMS_CARDIO, pharmacyStatus: 'dispensed', payment: { method: 'cash', status: 'completed' } },
    { phone: '9100000002', time: '09:15', apptStatus: 'completed', tokenStatus: 'completed', token: 2,
      complaint: 'Palpitations, anxiety', diagnosis: 'Benign PVCs — reassured',
      rx: RX_ITEMS_CARDIO.slice(0, 2), pharmacyStatus: 'pending', payment: { method: 'upi_offline', status: 'completed' } },
    { phone: '9100000003', time: '09:30', apptStatus: 'in_consultation', tokenStatus: 'in_consultation', token: 3,
      complaint: 'Hypertension follow-up', diagnosis: 'Essential hypertension',
      rx: RX_ITEMS_CARDIO.slice(0, 1), pharmacyStatus: 'draft', payment: null },
    { phone: '9100000004', time: '09:45', apptStatus: 'checked_in', tokenStatus: 'called', token: 4,
      complaint: null, diagnosis: null, rx: null, payment: null },
    { phone: '9100000005', time: '10:00', apptStatus: 'checked_in', tokenStatus: 'waiting', token: 5,
      complaint: null, diagnosis: null, rx: null, payment: null },
    { phone: '9100000006', time: '10:15', apptStatus: 'checked_in', tokenStatus: 'skipped', token: 6,
      complaint: null, diagnosis: null, rx: null, payment: null },
    { phone: '9100000007', time: '10:30', apptStatus: 'confirmed', tokenStatus: null, token: null,
      bookedVia: 'phone', complaint: null, rx: null, payment: null },
    { phone: '9100000008', time: '11:00', apptStatus: 'pending', tokenStatus: null, token: null,
      bookedVia: 'website', complaint: null, rx: null, payment: null },
    { phone: '9100000009', time: '11:30', apptStatus: 'cancelled', tokenStatus: null, token: null,
      bookedVia: 'website', complaint: null, rx: null, payment: null },
    { phone: '9100000010', time: '12:00', apptStatus: 'no_show', tokenStatus: null, token: null,
      bookedVia: 'phone', complaint: null, rx: null, payment: null },
  ];

  let maxToken = 0;
  for (const s of scenarios) {
    const apptId = await insertAppointment(pool, {
      patientId: p(s.phone), doctorId: maske.id, date: today, time: s.time,
      status: s.apptStatus, bookedVia: s.bookedVia || 'walk_in',
    });

    if (s.token) {
      maxToken = Math.max(maxToken, s.token);
      await insertToken(pool, {
        appointmentId: apptId, doctorId: maske.id, visitDate: today,
        tokenNumber: s.token, status: s.tokenStatus,
        calledAt: ['called', 'in_consultation', 'completed', 'skipped'].includes(s.tokenStatus) ? new Date() : null,
        completedAt: s.tokenStatus === 'completed' ? new Date() : null,
      });
    }

    if (s.complaint) {
      const consultId = await insertConsultation(pool, {
        appointmentId: apptId, doctorId: maske.id, patientId: p(s.phone),
        complaint: s.complaint, diagnosis: s.diagnosis, notes: 'Demo consultation notes.',
      });
      if (s.rx?.length) {
        await insertPrescription(pool, {
          consultationId: consultId, doctorId: maske.id, patientId: p(s.phone),
          advice: 'Low salt diet. Regular walking 30 min daily. Follow up in 2 weeks.',
          pharmacyStatus: s.pharmacyStatus, items: s.rx, pharmacistId,
        });
      }
    }

    if (s.payment) {
      await insertPayment(pool, {
        appointmentId: apptId, amount: maske.consultation_fee,
        method: s.payment.method, status: s.payment.status, recordedBy: adminId,
      });
    }
  }

  await pool.query(
    `INSERT INTO opd_token_counters (doctor_id, visit_date, last_token) VALUES ($1, $2, $3)
     ON CONFLICT (doctor_id, visit_date) DO UPDATE SET last_token = $3`,
    [maske.id, today, maxToken]
  );

  // ── TODAY — other doctors (smaller queues) ──
  if (moon) {
    const apptId = await insertAppointment(pool, {
      patientId: p('9100000011'), doctorId: moon.id, date: today, time: '10:00',
      status: 'completed', bookedVia: 'walk_in',
    });
    await insertToken(pool, { appointmentId: apptId, doctorId: moon.id, visitDate: today, tokenNumber: 1, status: 'completed', completedAt: new Date() });
    const cId = await insertConsultation(pool, {
      appointmentId: apptId, doctorId: moon.id, patientId: p('9100000011'),
      complaint: 'Chronic sinusitis', diagnosis: 'Allergic rhinitis with sinusitis', notes: 'Advised steam inhalation.',
    });
    await insertPrescription(pool, {
      consultationId: cId, doctorId: moon.id, patientId: p('9100000011'),
      advice: 'Avoid cold foods and dust exposure.', pharmacyStatus: 'pending', items: RX_ITEMS_ENT, pharmacistId,
    });
    await insertPayment(pool, { appointmentId: apptId, amount: moon.consultation_fee, method: 'card_offline', status: 'completed', recordedBy: adminId });
    await pool.query(
      `INSERT INTO opd_token_counters (doctor_id, visit_date, last_token) VALUES ($1, $2, 1) ON CONFLICT (doctor_id, visit_date) DO UPDATE SET last_token = 1`,
      [moon.id, today]
    );
  }

  if (kolhe) {
    const apptId = await insertAppointment(pool, {
      patientId: p('9100000012'), doctorId: kolhe.id, date: today, time: '11:00',
      status: 'checked_in', bookedVia: 'website',
    });
    await insertToken(pool, { appointmentId: apptId, doctorId: kolhe.id, visitDate: today, tokenNumber: 1, status: 'waiting' });
    await pool.query(
      `INSERT INTO opd_token_counters (doctor_id, visit_date, last_token) VALUES ($1, $2, 1) ON CONFLICT (doctor_id, visit_date) DO UPDATE SET last_token = 1`,
      [kolhe.id, today]
    );
  }

  if (lodhi) {
    const apptId = await insertAppointment(pool, {
      patientId: p('9100000013'), doctorId: lodhi.id, date: today, time: '17:00',
      status: 'confirmed', bookedVia: 'phone',
    });
    // not checked in yet
  }

  // ── FUTURE appointments ──
  await insertAppointment(pool, {
    patientId: p('9100000014'), doctorId: maske.id, date: daysAhead(1), time: '09:00',
    status: 'confirmed', bookedVia: 'website',
  });
  await insertAppointment(pool, {
    patientId: p('9100000015'), doctorId: maske.id, date: daysAhead(3), time: '10:30',
    status: 'pending', bookedVia: 'website',
  });
  if (moon) {
    await insertAppointment(pool, {
      patientId: p('9100000001'), doctorId: moon.id, date: daysAhead(2), time: '11:00',
      status: 'confirmed', bookedVia: 'phone',
    });
  }

  // ── PAST consultations (history) ──
  const pastCases = [
    { phone: '9100000001', doctor: maske, days: 3, time: '09:30', complaint: 'BP check', diagnosis: 'Hypertension controlled', rx: RX_ITEMS_CARDIO.slice(0, 1), pharmacy: 'dispensed' },
    { phone: '9100000002', doctor: maske, days: 7, time: '10:00', complaint: 'Breathlessness', diagnosis: 'Mild LV dysfunction', rx: RX_ITEMS_CARDIO, pharmacy: 'dispensed' },
    { phone: '9100000003', doctor: maske, days: 14, time: '09:15', complaint: 'Routine follow-up', diagnosis: 'Post-angioplasty stable', rx: RX_ITEMS_CARDIO.slice(0, 2), pharmacy: 'dispensed' },
    { phone: '9100000011', doctor: moon, days: 5, time: '10:30', complaint: 'Ear pain', diagnosis: 'Otitis media', rx: RX_ITEMS_ENT, pharmacy: 'dispensed' },
    { phone: '9100000012', doctor: kolhe, days: 10, time: '11:00', complaint: 'Knee pain', diagnosis: 'OA knee bilateral', rx: RX_ITEMS_ORTHO, pharmacy: 'dispensed' },
    { phone: '9100000014', doctor: lodhi, days: 6, time: '17:30', complaint: 'Antenatal visit', diagnosis: 'G2P1L1 — 24 weeks', rx: RX_ITEMS_GYNAE, pharmacy: 'dispensed' },
    { phone: '9100000005', doctor: khandait, days: 4, time: '19:00', complaint: 'Migraine', diagnosis: 'Migraine without aura', rx: RX_ITEMS_NEURO, pharmacy: 'dispensed' },
  ];

  for (const c of pastCases) {
    if (!c.doctor) continue;
    const date = daysAgo(c.days);
    const apptId = await insertAppointment(pool, {
      patientId: p(c.phone), doctorId: c.doctor.id, date, time: c.time, status: 'completed', bookedVia: 'walk_in',
    });
    await insertToken(pool, {
      appointmentId: apptId, doctorId: c.doctor.id, visitDate: date,
      tokenNumber: 1, status: 'completed', completedAt: new Date(date),
    });
    const consultId = await insertConsultation(pool, {
      appointmentId: apptId, doctorId: c.doctor.id, patientId: p(c.phone),
      complaint: c.complaint, diagnosis: c.diagnosis, notes: 'Past demo visit.',
    });
    await insertPrescription(pool, {
      consultationId: consultId, doctorId: c.doctor.id, patientId: p(c.phone),
      advice: 'Follow up as needed.', pharmacyStatus: c.pharmacy, items: c.rx, pharmacistId,
    });
    await insertPayment(pool, {
      appointmentId: apptId, amount: c.doctor.consultation_fee,
      method: ['cash', 'upi_offline', 'card_offline'][c.days % 3], status: 'completed', recordedBy: adminId,
    });
  }

  // ── Pending payment demo ──
  const pendingPayAppt = await insertAppointment(pool, {
    patientId: p('9100000008'), doctorId: maske.id, date: daysAgo(1), time: '16:00',
    status: 'completed', bookedVia: 'walk_in',
  });
  await insertPayment(pool, {
    appointmentId: pendingPayAppt, amount: maske.consultation_fee,
    method: 'cash', status: 'pending', recordedBy: null,
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
  console.log(`  • Today: Dr Maske OPD queue tokens #1–#6 + all appointment statuses`);
  console.log(`  • Pharmacy: 2 pending Rx (Priya + ENT patient), 1 dispensed`);
  console.log(`  • ${pastCases.length} past consultations with history`);
  console.log(`  • Future bookings, payments (cash/UPI/card), medicine templates`);
}
