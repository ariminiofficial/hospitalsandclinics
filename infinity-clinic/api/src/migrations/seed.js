import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { allCmsSections } from '../data/cmsDefaults.js';
import { seedDefaultPermissions } from '../permissions/service.js';
import { seedDemoData } from './seedDemo.js';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@pulseclinic.demo';
const DOCTOR_EMAIL = 'doctor@pulseclinic.demo';
const RECEPTIONIST_EMAIL = 'receptionist@pulseclinic.demo';
const PHARMACIST_EMAIL = 'pharmacy@pulseclinic.demo';

function getInitialCred(role) {
  return process.env[`SEED_${role.toUpperCase()}_AUTH`] || `${role.charAt(0).toUpperCase() + role.slice(1)}@123`;
}

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
    rawAuth: getInitialCred('doctor'),
    full_name: 'Dr. Aarav Sharma',
    specialization: 'Cardiology',
    qualification: 'MBBS · MD Internal Medicine · DM Cardiology',
    bio: 'Consultant Interventional Cardiologist — Angiography, Angioplasty, ECG, 2D-ECHO, TMT.',
    consultation_fee: 800,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'nair@pulseclinic.demo',
    rawAuth: getInitialCred('doctor'),
    full_name: 'Dr. Priya Nair',
    specialization: 'ENT',
    qualification: 'MBBS · MS (ENT) · DNB-ENT',
    bio: 'Certified in Vertigo & Endoscopic Sinus Surgery. Allergy, endoscopy, vertigo, thyroid & hearing evaluations.',
    consultation_fee: 600,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'kapoor@pulseclinic.demo',
    rawAuth: getInitialCred('doctor'),
    full_name: 'Dr. Rohan Kapoor',
    specialization: 'Orthopaedics',
    qualification: 'MBBS · MS Orthopaedics · Fellow in Joint Replacement & Arthroscopy',
    bio: 'Specialist in arthroscopy, joint preservation, fractures, sports injuries & spine care.',
    consultation_fee: 700,
    schedules: STANDARD_SCHEDULE,
  },
  {
    email: 'sen@pulseclinic.demo',
    rawAuth: getInitialCred('doctor'),
    full_name: 'Dr. Ananya Sen',
    specialization: 'Neurology',
    qualification: 'MBBS · MD · DM Neurology',
    bio: 'Specialist in headache, stroke, epilepsy, peripheral neuropathy & movement disorders.',
    consultation_fee: 900,
    schedules: EVENING_SCHEDULE,
  },
  {
    email: 'mehta@pulseclinic.demo',
    rawAuth: getInitialCred('doctor'),
    full_name: 'Dr. Sunita Mehta',
    specialization: 'Gynaecology',
    qualification: 'MBBS · MS (OBG) · DNB',
    bio: 'Adolescent health, high-risk pregnancy, PCOS management, menopause & preventive health.',
    consultation_fee: 700,
    schedules: STANDARD_SCHEDULE,
  },
];

async function seed() {
  console.log('Seeding initial data...');

  const adminHash = await bcrypt.hash(getInitialCred('admin'), 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name)
     VALUES ($1, $2, 'admin', 'Administrator')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [ADMIN_EMAIL, adminHash]
  );

  for (const doc of DOCTORS) {
    const docHash = await bcrypt.hash(doc.rawAuth, 10);
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, 'doctor', $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [doc.email, docHash, doc.full_name]
    );
    const userId = userRows[0].id;

    const { rows: docRows } = await pool.query(
      `INSERT INTO doctors (user_id, specialization, qualification, bio, consultation_fee)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         specialization = EXCLUDED.specialization,
         qualification = EXCLUDED.qualification,
         bio = EXCLUDED.bio,
         consultation_fee = EXCLUDED.consultation_fee
       RETURNING id`,
      [userId, doc.specialization, doc.qualification, doc.bio, doc.consultation_fee]
    );
    const doctorId = docRows[0].id;

    await pool.query('DELETE FROM doctor_schedules WHERE doctor_id = $1', [doctorId]);
    for (const sched of doc.schedules) {
      for (const day of sched.days) {
        for (const slot of sched.slots) {
          await pool.query(
            `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
             VALUES ($1, $2, $3, $4, 15)`,
            [doctorId, day, slot.start, slot.end]
          );
        }
      }
    }
  }

  const recHash = await bcrypt.hash(getInitialCred('receptionist'), 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name)
     VALUES ($1, $2, 'receptionist', 'Front Desk')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [RECEPTIONIST_EMAIL, recHash]
  );

  const pharmHash = await bcrypt.hash(getInitialCred('pharmacist'), 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, role, full_name)
     VALUES ($1, $2, 'pharmacist', 'Clinic Pharmacy')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [PHARMACIST_EMAIL, pharmHash]
  );

  for (const s of allCmsSections) {
    await pool.query(
      `INSERT INTO cms_sections (section_key, title, subtitle, content, is_published)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (section_key) DO UPDATE SET
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         content = EXCLUDED.content`,
      [s.section_key, s.title, s.subtitle, JSON.stringify(s.content)]
    );
  }

  const services = [
    { name: '12-Lead Digital ECG', category: 'Diagnostics', description: 'Resting 12-lead electrocardiogram with on-spot automated interpretation and specialist review.', duration_minutes: 15, default_price: 350 },
    { name: '2D-ECHO (Echocardiography)', category: 'Diagnostics', description: 'Color Doppler transthoracic echocardiogram to assess cardiac structure, ejection fraction, and valvular function.', duration_minutes: 30, default_price: 1800 },
    { name: 'Treadmill Stress Test (TMT)', category: 'Diagnostics', description: 'Computerized stress ECG on motorized treadmill to evaluate inducible myocardial ischaemia.', duration_minutes: 45, default_price: 2200 },
    { name: 'Diagnostic Rigid Nasal Endoscopy', category: 'ENT Procedures', description: 'High-definition endoscopic visualization of nasal cavities, septum, sinuses, and nasopharynx.', duration_minutes: 15, default_price: 850 },
    { name: 'Video Otoscopy & Ear Debris Suction', category: 'ENT Procedures', description: 'High-magnification ear canal visualization and micro-suction clearance of wax, fungal debris, or foreign bodies.', duration_minutes: 15, default_price: 500 },
    { name: 'Intra-Articular Knee Injection (Single Knee)', category: 'Orthopaedic Procedures', description: 'Sterile injection of corticosteroid, hyaluronic acid, or viscosupplementation into the joint space.', duration_minutes: 20, default_price: 1200 },
    { name: 'Short Arm / Short Leg Fibreglass Slab', category: 'Orthopaedic Procedures', description: 'Synthetic lightweight waterproof immobilisation slab for undisplaced fractures and soft tissue injuries.', duration_minutes: 25, default_price: 950 },
    { name: 'Digital Neurological Reflex & Sensation Battery', category: 'Neurology Procedures', description: 'Comprehensive cranial nerve, deep tendon reflex, autonomic screen, and vibration sensory threshold assessment.', duration_minutes: 30, default_price: 600 },
    { name: 'High-Resolution Pelvic Ultrasound', category: 'Women\'s Health & Ultrasound', description: 'Transabdominal or transvaginal pelvic ultrasonography for uterine, endometrial, and ovarian morphology.', duration_minutes: 25, default_price: 1400 },
    { name: 'Liquid-Based Cytology Pap Smear', category: 'Women\'s Health & Ultrasound', description: 'Cervical cancer screening test with high-yield liquid medium for cytology and reflex HPV testing.', duration_minutes: 15, default_price: 900 },
    { name: 'Complete Blood Count (CBC) + ESR', category: 'Laboratory Panels', description: 'Automated 5-part differential haemogram including Hb, platelets, TLC, DLC, red cell indices, and ESR.', duration_minutes: 5, default_price: 350 },
    { name: 'HbA1c (Glycated Haemoglobin)', category: 'Laboratory Panels', description: 'NGSP/IFCC standardised measurement of average blood glucose over the preceding 90 days.', duration_minutes: 5, default_price: 450 },
  ];

  for (const s of services) {
    await pool.query(
      `INSERT INTO clinical_services (name, category, description, duration_minutes, default_price, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (name) DO UPDATE SET
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         duration_minutes = EXCLUDED.duration_minutes,
         default_price = EXCLUDED.default_price`,
      [s.name, s.category, s.description, s.duration_minutes, s.default_price]
    );
  }

  const testimonials = [
    { name: 'Sunil Mehta', content: 'Dr. Sharma identified my heart condition on the spot. The in-house ECG and 2D-ECHO meant I did not have to visit three different diagnostic labs. World-class care.', rating: 5 },
    { name: 'Kavita Iyer', content: 'My sinus issues were resolved within two visits after an endoscopic evaluation. Transparent billing and minimal waiting time.', rating: 5 },
    { name: 'Deepak Patel', content: 'The appointment booking and live OPD token queue were completely seamless. My knee arthroscopy rehabilitation has been smooth.', rating: 5 },
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
     ('clinic_phone', '"9876543210"'),
     ('clinic_address', '"Plot No. 42, Metro Health Park, Central Avenue, City Centre – 400001"')
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
  );

  await seedDefaultPermissions();

  if (process.env.SEED_DEMO !== 'false') {
    await seedDemoData(pool);
  }

  console.log('\nSeed completed successfully.');
  console.log('Default accounts initialized: Admin, Doctors, Receptionist, Pharmacist.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
