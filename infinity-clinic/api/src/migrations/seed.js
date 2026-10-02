import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { allCmsSections } from '../data/cmsDefaults.js';
import { seedDefaultPermissions } from '../permissions/service.js';
import { seedDemoData } from './seedDemo.js';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@pulseclinic.demo';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const DOCTOR_EMAIL = 'doctor@pulseclinic.demo';
const DOCTOR_PASSWORD = 'Doctor@123';
const RECEPTIONIST_EMAIL = 'receptionist@pulseclinic.demo';
const RECEPTIONIST_PASSWORD = 'Reception@123';
const PHARMACIST_EMAIL = 'pharmacy@pulseclinic.demo';
const PHARMACIST_PASSWORD = 'Pharmacy@123';

const CLINIC_PHONE = '9876543210';
const CLINIC_ADDRESS = 'Plot No. 42, Metro Health Park, Central Avenue, City Centre – 400001';

const STANDARD_SCHEDULE = [
  { days: [1, 2, 3, 4, 5, 6], slots: [{ start: '09:00', end: '13:00' }, { start: '17:00', end: '20:00' }] },
];

const EVENING_SCHEDULE = [
  { days: [1, 2, 3, 4, 5, 6], slots: [{ start: '19:00', end: '21:00' }] },
];

const DOCTORS = [
  {
    email: DOCTOR_EMAIL,
    password: DOCTOR_PASSWORD,
    full_name: 'Dr. Aarav Sharma',
    specialization: 'Cardiology',
    qualification: 'MBBS · MD Internal Medicine · DM Cardiology',
    bio: 'Consultant Interventional Cardiologist — Angiography, Angioplasty, ECG, 2D-ECHO, TMT.',
    consultation_fee: 800,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'nair@pulseclinic.demo',
    password: 'Doctor@123',
    full_name: 'Dr. Priya Nair',
    specialization: 'ENT',
    qualification: 'MBBS · MS (ENT) · DNB-ENT',
    bio: 'Certified in Vertigo & Endoscopic Sinus Surgery. Allergy, endoscopy, vertigo, thyroid & hearing evaluations.',
    consultation_fee: 600,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'kapoor@pulseclinic.demo',
    password: 'Doctor@123',
    full_name: 'Dr. Rohan Kapoor',
    specialization: 'Orthopaedics',
    qualification: 'MBBS · MS Orthopaedics · Fellow in Joint Replacement & Arthroscopy',
    bio: 'Specialist in arthroscopy, joint preservation, fractures, sports injuries & spine care.',
    consultation_fee: 700,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'sen@pulseclinic.demo',
    password: 'Doctor@123',
    full_name: 'Dr. Ananya Sen',
    specialization: 'Neurology',
    qualification: 'MBBS · MD (Medicine) · DM (Neurology)',
    bio: 'Brain, Spine & Nerve Specialist. Evening OPD 7:00 – 9:00 PM.',
    consultation_fee: 700,
    schedules: EVENING_SCHEDULE,
  },
  {
    email: 'roy@pulseclinic.demo',
    password: 'Doctor@123',
    full_name: 'Dr. Kavita Roy',
    specialization: 'Gynaecology',
    qualification: 'MBBS · MD (Obstetrics & Gynaecology) · Fellowship in Reproductive Medicine',
    bio: 'Consultant Obstetrician & Gynaecologist — high-risk pregnancy, fertility evaluation, hormonal & period care.',
    consultation_fee: 600,
    schedules: STANDARD_SCHEDULE,
  },
];

async function ensureUser(email, password, role) {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (rows.length > 0) return rows[0].id;
  const hash = await bcrypt.hash(password, 12);
  const { rows: created } = await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
    [email, hash, role]
  );
  return created[0].id;
}

async function ensureDoctor({ email, password, full_name, specialization, qualification, bio, consultation_fee, schedules }) {
  const userId = await ensureUser(email, password, 'doctor');
  const { rows: existing } = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [userId]);
  let doctorId;
  if (existing.length === 0) {
    const { rows } = await pool.query(
      `INSERT INTO doctors (user_id, full_name, specialization, qualification, bio, consultation_fee)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, full_name, specialization, qualification, bio, consultation_fee]
    );
    doctorId = rows[0].id;
  } else {
    doctorId = existing[0].id;
    await pool.query(
      `UPDATE doctors SET full_name = $2, specialization = $3, qualification = $4, bio = $5, consultation_fee = $6, updated_at = NOW()
       WHERE id = $1`,
      [doctorId, full_name, specialization, qualification, bio, consultation_fee]
    );
  }

  for (const block of schedules) {
    for (const day of block.days) {
      for (const slot of block.slots) {
        const { rows } = await pool.query(
          `SELECT id FROM doctor_schedules WHERE doctor_id = $1 AND day_of_week = $2 AND start_time = $3`,
          [doctorId, day, slot.start]
        );
        if (rows.length === 0) {
          await pool.query(
            `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
             VALUES ($1, $2, $3, $4, 15)`,
            [doctorId, day, slot.start, slot.end]
          );
        }
      }
    }
  }
  return doctorId;
}

async function seed() {
  await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'admin');

  for (const doc of DOCTORS) {
    await ensureDoctor(doc);
  }

  const recUserId = await ensureUser(RECEPTIONIST_EMAIL, RECEPTIONIST_PASSWORD, 'receptionist');
  const { rows: existingRec } = await pool.query('SELECT id FROM receptionists WHERE user_id = $1', [recUserId]);
  if (existingRec.length === 0) {
    await pool.query(`INSERT INTO receptionists (user_id, full_name) VALUES ($1, 'Front Desk')`, [recUserId]);
  }

  const pharmUserId = await ensureUser(PHARMACIST_EMAIL, PHARMACIST_PASSWORD, 'pharmacist');
  const { rows: existingPharm } = await pool.query('SELECT id FROM pharmacists WHERE user_id = $1', [pharmUserId]);
  if (existingPharm.length === 0) {
    await pool.query(`INSERT INTO pharmacists (user_id, full_name) VALUES ($1, 'Pharmacy Desk')`, [pharmUserId]);
  }

  const defaultContent = allCmsSections();

  for (const section of defaultContent) {
    await pool.query(
      `INSERT INTO website_content (section_key, content) VALUES ($1, $2)
       ON CONFLICT (section_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
      [section.key, JSON.stringify(section.content)]
    );
  }

  const services = [
    { title: 'Blood Sugar Test (Random / Fasting)', description: 'Quick glucometer / lab glucose testing for diabetes monitoring', price: 100, category: 'Lab & Diagnostics', durationMinutes: 10, icon: 'test' },
    { title: 'Blood Pressure (BP) Monitoring', description: 'Digital & manual sphygmomanometer blood pressure evaluation', price: 50, category: 'Vitals & Screening', durationMinutes: 5, icon: 'heart' },
    { title: 'MRI Scan (Brain / Spine / Joints)', description: 'High-resolution Magnetic Resonance Imaging diagnostic scan', price: 5500, category: 'Radiology & Scans', durationMinutes: 45, icon: 'scan' },
    { title: '12-Lead Digital ECG', description: 'Comprehensive electrocardiogram with immediate cardiologist review', price: 350, category: 'Cardiology', durationMinutes: 15, icon: 'heart' },
    { title: '2D-ECHO (Echocardiography)', description: 'Colour doppler transthoracic ultrasound assessment of cardiac structure', price: 1800, category: 'Cardiology', durationMinutes: 30, icon: 'heart' },
    { title: 'TMT (Treadmill Stress Test)', description: 'Continuous cardiac stress testing under cardiologist supervision', price: 2000, category: 'Cardiology', durationMinutes: 40, icon: 'heart' },
    { title: 'Digital X-Ray', description: 'High precision digital radiography (Chest / Spine / Extremities)', price: 600, category: 'Radiology & Scans', durationMinutes: 15, icon: 'scan' },
    { title: 'Ultrasound (USG Abdomen & Pelvis)', description: 'Full abdominal and pelvic sonography with detailed radiologist report', price: 1200, category: 'Radiology & Scans', durationMinutes: 20, icon: 'scan' },
    { title: 'Complete Blood Count (CBC) + ESR', description: 'Comprehensive haemogram report with cell count and morphology', price: 350, category: 'Lab & Diagnostics', durationMinutes: 15, icon: 'test' },
    { title: 'Lipid Profile', description: 'Complete cholesterol, triglycerides, HDL, LDL risk panel', price: 650, category: 'Lab & Diagnostics', durationMinutes: 15, icon: 'test' },
    { title: 'HbA1c (Glycated Haemoglobin)', description: '3-month average blood glucose control assessment', price: 450, category: 'Lab & Diagnostics', durationMinutes: 15, icon: 'test' },
    { title: 'Video Endoscopy (ENT)', description: 'Diagnostic endoscopic examination of nasal cavity, throat and vocal cords', price: 1200, category: 'ENT & Hearing', durationMinutes: 20, icon: 'ent' },
    { title: 'Pure Tone Audiometry (Hearing Test)', description: 'Formal soundproof booth hearing threshold evaluation', price: 700, category: 'ENT & Hearing', durationMinutes: 25, icon: 'ent' },
    { title: 'Wound Dressing & Suturing', description: 'Sterile antiseptic wound cleaning, debridement and minor surgical dressing', price: 300, category: 'Procedures', durationMinutes: 20, icon: 'ortho' },
    { title: 'Nebulization Therapy', description: 'Aerosol bronchodilator delivery for asthma / acute breathlessness', price: 200, category: 'Procedures', durationMinutes: 15, icon: 'general' },
  ];
  for (const [i, s] of services.entries()) {
    const { rows } = await pool.query('SELECT id FROM services WHERE title = $1', [s.title]);
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO services (title, description, price, category, duration_minutes, icon, is_published, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, true, true, $7)`,
        [s.title, s.description, s.price, s.category, s.durationMinutes, s.icon, i]
      );
    } else {
      await pool.query(
        `UPDATE services SET description = $2, price = $3, category = $4, duration_minutes = $5, icon = $6, sort_order = $7 WHERE id = $1`,
        [rows[0].id, s.description, s.price, s.category, s.durationMinutes, s.icon, i]
      );
    }
  }

  const testimonials = [
    { name: 'Ramesh K.', content: 'Dr. Sharma explained my ECG results clearly and arranged all cardiac tests the same week. Very professional and helpful experience.', rating: 5 },
    { name: 'Sunita M.', content: 'Visited Dr. Roy for a pregnancy follow-up. The clinic is well organised and the staff handled all my reports seamlessly.', rating: 5 },
    { name: 'Amit P.', content: 'Dr. Kapoor treated my knee ligament injury and guided my recovery. Excellent orthopaedic surgeon and modern facility.', rating: 5 },
    { name: 'Priya S.', content: 'My son had recurring ear infections. Dr. Nair found the root cause with gentle on-site endoscopy.', rating: 5 },
    { name: 'Vikram D.', content: 'Evening OPD timing suited my office schedule. Dr. Sen took time to explain my migraine triggers and adjusted medication properly.', rating: 5 },
    { name: 'Anjali R.', content: 'My parents see the cardiologist and I see the orthopaedic surgeon — in the same medical centre. Extremely convenient and well run.', rating: 5 },
  ];
  for (const [i, t] of testimonials.entries()) {
    const { rows } = await pool.query('SELECT id FROM testimonials WHERE patient_name = $1', [t.name]);
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO testimonials (patient_name, content, rating, sort_order) VALUES ($1, $2, $3, $4)`,
        [t.name, t.content, t.rating, i]
      );
    } else {
      await pool.query(
        `UPDATE testimonials SET content = $2, rating = $3, sort_order = $4 WHERE id = $1`,
        [rows[0].id, t.content, t.rating, i]
      );
    }
  }

  await pool.query(
    `INSERT INTO clinic_settings (key, value) VALUES
     ('clinic_name', '"Pulse Multi-Specialty Clinic"'),
     ('appointment_slot_duration', '15'),
     ('clinic_phone', '"${CLINIC_PHONE}"'),
     ('clinic_address', '"${CLINIC_ADDRESS}"')
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
  );

  await seedDefaultPermissions();

  if (process.env.SEED_DEMO !== 'false') {
    await seedDemoData(pool);
  }

  console.log('\nSeed complete.');
  console.log('────────────── Logins ──────────────');
  console.log(`Admin:        ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Doctor:       ${DOCTOR_EMAIL} / ${DOCTOR_PASSWORD} (Dr. Aarav Sharma)`);
  console.log(`Receptionist: ${RECEPTIONIST_EMAIL} / ${RECEPTIONIST_PASSWORD}`);
  console.log(`Pharmacist:   ${PHARMACIST_EMAIL} / ${PHARMACIST_PASSWORD}`);
  console.log('────────────── Demo patients ───────');
  console.log('Phones: 9100000001 – 9100000015 (search in receptionist/doctor portal)');
  console.log('Today OPD: all active appointments are in the live queue (Sharma #1–#8 + other doctors)');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
