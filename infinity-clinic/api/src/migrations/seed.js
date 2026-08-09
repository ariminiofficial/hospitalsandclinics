import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { allCmsSections } from '../data/cmsDefaults.js';
import { seedDefaultPermissions } from '../permissions/service.js';
import { seedDemoData } from './seedDemo.js';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@infinityclinic.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
const DOCTOR_EMAIL = 'doctor@infinityclinic.com';
const DOCTOR_PASSWORD = 'Doctor@123';
const RECEPTIONIST_EMAIL = 'receptionist@infinityclinic.com';
const RECEPTIONIST_PASSWORD = 'Reception@123';
const PHARMACIST_EMAIL = 'pharmacy@infinityclinic.com';
const PHARMACIST_PASSWORD = 'Pharmacy@123';

const CLINIC_PHONE = '8888797624';
const CLINIC_ADDRESS = 'House No. 8863-94, Chandrabhaga Layout, Manewada Ring Road, Omkar Nagar, Nagpur – 440027, Maharashtra';

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
    full_name: 'Dr. Mahendra Maske',
    specialization: 'Cardiology',
    qualification: 'MBBS · MD Internal Medicine (Gold Medallist) · DM Cardiology',
    bio: 'Consultant Interventional Cardiologist — Angiography, Angioplasty, ECG, 2D-ECHO, TMT.',
    consultation_fee: 800,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'moon@infinityclinics.com',
    password: 'Doctor@123',
    full_name: 'Dr. Prasann Moon',
    specialization: 'ENT',
    qualification: 'MBBS · MS · DNB-ENT · MNAMS',
    bio: 'Certified in Vertigo & Endoscopic Sinus Surgery. Allergy, endoscopy, vertigo, thyroid & hearing aid fitting.',
    consultation_fee: 600,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'kolhe@infinityclinics.com',
    password: 'Doctor@123',
    full_name: 'Dr. Gunjan Kolhe',
    specialization: 'Orthopaedics',
    qualification: "MBBS · D'Ortho · FIJR · FIAS — Orthopaedic Surgeon",
    bio: 'Fellowship in Arthroscopy & Joint Replacement (Pune, Mumbai). Fractures, joint pain, sports injuries & spine care.',
    consultation_fee: 700,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'khandait@infinityclinics.com',
    password: 'Doctor@123',
    full_name: 'Dr. Pranit Khandait',
    specialization: 'Neurology',
    qualification: 'MBBS · MD (Medicine) · DM (Neurology)',
    bio: 'Brain, Spine & Nerve Specialist. Evening OPD 7:00 – 9:00 PM.',
    consultation_fee: 700,
    schedules: EVENING_SCHEDULE,
  },
  {
    email: 'lodhi@infinityclinics.com',
    password: 'Doctor@123',
    full_name: 'Dr. Shweta Lodhi',
    specialization: 'Gynaecology',
    qualification: 'MBBS · DGO · DRM (Diploma in Reproductive Medicine, Germany)',
    bio: 'Consultant Obstetrician & Gynaecologist — high-risk pregnancy, infertility, hormonal & period issues.',
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
    { title: 'Infinity Heart Clinic', description: 'Angiography, Angioplasty, ECG, 2D-ECHO, TMT — Dr. Mahendra Maske', icon: 'heart' },
    { title: 'ENT Clinic', description: 'Allergy, endoscopy, vertigo, thyroid & hearing aid fitting — Dr. Prasann Moon', icon: 'ent' },
    { title: 'Bone & Joint', description: 'Arthroscopy, joint replacement, spine, trauma & pain management — Dr. Gunjan Kolhe', icon: 'ortho' },
    { title: 'Neurology', description: 'Paralysis, epilepsy, migraine, vertigo, memory & neuropathy — Dr. Pranit Khandait', icon: 'neuro' },
    { title: 'Gynaecology', description: 'High-risk pregnancy, infertility, hormonal & period issues — Dr. Shweta Lodhi', icon: 'gynae' },
  ];
  for (const [i, s] of services.entries()) {
    const { rows } = await pool.query('SELECT id FROM services WHERE title = $1', [s.title]);
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO services (title, description, icon, sort_order) VALUES ($1, $2, $3, $4)`,
        [s.title, s.description, s.icon, i]
      );
    }
  }

  const testimonials = [
    { name: 'Ramesh K.', content: 'Dr. Maske explained my ECG results clearly and arranged angiography the same week. Very professional — I did not have to go to another hospital for the procedure.', rating: 5 },
    { name: 'Sunita M.', content: 'Visited Dr. Lodhi for a high-risk pregnancy follow-up. The clinic is well organised and the staff helped with all my reports in one place.', rating: 5 },
    { name: 'Amit P.', content: 'Dr. Kolhe treated my knee injury with arthroscopy. Recovery was faster than I expected. Good to have a fellowship-trained surgeon in Omkar Nagar itself.', rating: 5 },
    { name: 'Priya S.', content: 'My son had recurring ear infections. Dr. Moon found the root cause and we have not been back in six months. Endoscopy was done on-site — very convenient.', rating: 5 },
    { name: 'Vikram D.', content: 'Evening OPD timing suited my office hours. Dr. Khandait took time to explain my migraine triggers and adjusted medication properly.', rating: 5 },
    { name: 'Anjali R.', content: 'My parents see the cardiologist and I see the orthopaedic surgeon — same building, same week. That is why we chose Infinity Clinics over running around Nagpur.', rating: 5 },
  ];
  for (const [i, t] of testimonials.entries()) {
    const { rows } = await pool.query('SELECT id FROM testimonials WHERE patient_name = $1', [t.name]);
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO testimonials (patient_name, content, rating, sort_order) VALUES ($1, $2, $3, $4)`,
        [t.name, t.content, t.rating, i]
      );
    }
  }

  await pool.query(
    `INSERT INTO clinic_settings (key, value) VALUES
     ('clinic_name', '"Infinity Clinics"'),
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
  console.log(`Doctor:       ${DOCTOR_EMAIL} / ${DOCTOR_PASSWORD} (Dr. Mahendra Maske)`);
  console.log(`Receptionist: ${RECEPTIONIST_EMAIL} / ${RECEPTIONIST_PASSWORD}`);
  console.log(`Pharmacist:   ${PHARMACIST_EMAIL} / ${PHARMACIST_PASSWORD}`);
  console.log('────────────── Demo patients ───────');
  console.log('Phones: 9100000001 – 9100000015 (search in receptionist/doctor portal)');
  console.log('Today OPD: Dr Maske has tokens #1–#6 covering every queue status');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
