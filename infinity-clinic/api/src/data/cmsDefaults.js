/** Default website_content sections — seeded into DB and mirrored as web fallbacks */

export const CMS_DEFAULTS = {
  hero: {
    title: 'One address. Five specialists who talk to each other.',
    subtitle: 'Infinity Clinics — Omkar Nagar, Nagpur',
    lede: 'Infinity Clinics brings a cardiologist, an ENT surgeon, an orthopaedic surgeon, a neurologist and a gynaecologist into a single Omkar Nagar practice — so your reports, your history and your treatment plan don\'t get lost between waiting rooms.',
    ctaText: 'Book Appointment',
    ctaLink: '/book',
  },
  about: {
    eyebrow: 'About Infinity Clinics',
    title: 'A neighbourhood clinic built like a small hospital.',
    lede: 'Infinity Clinics started with a simple idea for Omkar Nagar families: keep the specialists local, keep the credentials visible, and stop sending patients across Nagpur for every second opinion.',
    body: 'A multi-specialty practice on Manewada Ring Road, Omkar Nagar, Nagpur — cardiology, ENT, orthopaedics, neurology and gynaecology under one roof.',
    story: [
      'On Manewada Ring Road, beside South Point School, five separate specialist practices share one address and one front desk. Each department is led by a named doctor with post-graduate training in their field — not a general physician rotating through different OPD counters.',
      'That structure matters when families deal with more than one health issue at a time. A parent with hypertension, a child with ear pain, and a grandmother with knee arthritis can all be seen under one roof, often in the same week, without losing medical records between buildings.',
      'We invested in on-site diagnostics where it counts most — ECG, 2D-ECHO, TMT for cardiac patients; endoscopy and hearing evaluation for ENT — so the common tests happen on the day of your visit, not three weeks later at another lab.',
    ],
    values: [
      { title: 'Transparency', body: 'Every department board shows the doctor\'s full name and qualifications. You know exactly who you are seeing before you walk in.' },
      { title: 'Accessibility', body: 'Street parking for two-wheelers at the gate. One phone number. Evening neurology OPD for working families.' },
      { title: 'Continuity', body: 'Follow-ups stay with the same specialist. Your cardiologist sees your ECG history; your gynaecologist tracks your pregnancy — not a different face each visit.' },
    ],
    whyTitle: 'What makes Infinity Clinics different.',
  },
  contact: {
    clinicName: 'Infinity Clinics',
    tagline: 'Omkar Nagar · Nagpur',
    phone: '+91 8888 797 624',
    email: 'info@infinityclinics.com',
    address: 'House No. 8863-94, Chandrabhaga Layout, Manewada Ring Road, Omkar Nagar, Nagpur – 440027, Maharashtra',
    hours: 'Mon–Sat: timings vary by department — please call ahead',
    landmark: 'Beside The South Point Public School (Nursery – 10th, CBSE)',
    neuroTiming: 'Evening OPD · 7:00 PM – 9:00 PM',
    generalTiming: 'Monday – Saturday · Morning & evening OPD slots',
    parking: 'Two-wheeler parking available at the gate. Four-wheeler parking is limited on the ring road — auto or two-wheeler recommended.',
    directionsFrom: 'Head towards Omkar Nagar on Manewada Ring Road. Infinity Clinics is on Chandrabhaga Layout, House No. 8863-94.',
    whatToBring: 'Previous medical reports, list of current medicines, valid ID. First-time patients: arrive 10 minutes early for registration.',
  },
  home: {
    specialistsEyebrow: 'Our Specialists',
    specialistsTitle: 'Five named doctors. Five departments.',
    specialistsDesc: 'Each board at Infinity Clinics is led by a post-graduate specialist — not a rotating general duty panel.',
    servicesEyebrow: 'Services & Diagnostics',
    servicesTitle: 'Tests and treatments on the same visit.',
    servicesDesc: 'ECG, 2D-ECHO, TMT, endoscopy and more — available on-site so you leave with answers, not another appointment slip.',
    whyEyebrow: 'Why Infinity Clinics',
    whyTitle: 'Built for how families actually get sick.',
    whyDesc: 'An ache in the knee, a parent\'s palpitations, a child\'s ear infection — rarely one problem at a time.',
    storiesEyebrow: 'Patient Stories',
    storiesTitle: 'Trusted by families across Omkar Nagar.',
    locationEyebrow: 'Find Us',
    locationTitle: 'Manewada Ring Road, beside South Point School',
    locationDesc: 'Street parking for two-wheelers at the gate. Look for the white board with the teal lotus mark.',
  },
  doctors_page: {
    eyebrow: 'Our Specialists',
    title: 'Five departments, five named doctors',
    lede: 'Every board at Infinity Clinics is led by a post-graduate specialist with their own credentials — DM Cardiology, DM Neurology, fellowship-trained orthopaedics. You see the same doctor every visit.',
    calloutTitle: 'Not sure which specialist you need?',
    calloutBody: 'Describe your symptoms to our front desk — we will guide you to the right department.',
  },
  services_page: {
    eyebrow: 'What We Treat',
    title: 'Services & diagnostics by department',
    lede: 'From angiography to arthroscopy, ENT endoscopy to high-risk pregnancy care — common treatments and on-site tests available at Manewada Ring Road.',
    diagnosticsEyebrow: 'On-Site Diagnostics',
    diagnosticsTitle: 'Tests done the same day as your visit.',
    diagnosticsDesc: 'No separate lab appointment for the most common cardiac and ENT investigations.',
    feeNoteTitle: 'Consultation fees are indicative',
    feeNoteBody: 'Final charges depend on the consultation type and any procedures or diagnostics performed during your visit. Call the front desk for the latest fee schedule before your appointment.',
    ctaTitle: 'Need help choosing a service?',
    ctaSubtitle: 'Call us and describe your symptoms — we will point you to the right department.',
  },
  contact_page: {
    eyebrow: 'Contact & Visit',
    title: 'Find us on Manewada Ring Road',
    lede: 'One front desk number for all five departments. Call, WhatsApp, or book online — we are in Omkar Nagar, beside South Point School.',
    timingsTitle: 'When to visit each specialist.',
    directionsTitle: 'Directions & parking.',
    firstVisitTitle: 'What happens when you arrive.',
    faqTitle: 'Common questions.',
  },
  testimonials_page: {
    eyebrow: 'Patient Stories',
    title: 'What families say about Infinity Clinics',
    lede: 'Feedback from patients across cardiology, ENT, orthopaedics, neurology and gynaecology — all under one roof in Omkar Nagar.',
    calloutTitle: 'Visited us recently?',
    calloutBody: 'We appreciate every patient who takes the time to share their experience. After your visit, tell our front desk — your feedback helps other families in Nagpur find the right specialist.',
    ctaTitle: 'Experience it yourself',
    ctaSubtitle: 'Book with the specialist who fits your needs — or call and we will guide you.',
  },
  book_page: {
    eyebrow: 'Online Booking',
    title: 'Book an appointment',
    lede: 'Select your specialist, pick a date and time, and we will see you at our Omkar Nagar clinic. Prefer to call? Reach us at any time on the number below.',
    hoursNote: 'Mon–Sat · Neurology evenings 7–9 PM',
    successNote: 'We\'ll confirm by phone. For urgent queries, call us on the number below.',
  },
  cta: {
    title: 'Not sure which doctor you need?',
    subtitle: 'Call the front desk — one number routes you to the right specialist.',
  },
  footer: {
    tagline: 'A multi-specialty practice on Manewada Ring Road, Omkar Nagar, Nagpur — five departments, one front desk.',
    disclaimer: 'Timings vary by department — please call ahead',
  },
  why_cards: {
    items: [
      { num: '01 — Continuity', title: 'Shared address, shared context', body: 'See the cardiologist for a check-up and the orthopaedic surgeon for a knee, same building, same week — no separate hospital transfers.' },
      { num: '02 — Credentials', title: 'Named specialists, not general duty doctors', body: "Each board carries one doctor's name and post-graduate qualification — DM Cardiology, DM Neurology, fellowship-trained orthopaedics — not a rotating panel." },
      { num: '03 — On-site diagnostics', title: 'ECG, 2D-ECHO, TMT & endoscopy in-house', body: 'Common cardiac and ENT diagnostics happen on the same visit, so you leave with answers, not just another appointment.' },
      { num: '04 — One front desk', title: 'A single number for all five departments', body: 'Call 8888 797 624 and the reception routes you to the right specialist — or book online and pick your doctor directly.' },
    ],
  },
  visit_steps: {
    items: [
      { step: '01', title: 'Call or book online', body: 'Reach us at 8888 797 624 or use the online booking form. Tell us which department you need — we will confirm the specialist\'s slot.' },
      { step: '02', title: 'Arrive with basics', body: 'Bring previous reports, current medicines and a valid ID. First-time patients: arrive 10 minutes early for registration.' },
      { step: '03', title: 'See your specialist', body: 'You will be seen by the named doctor for that department — not referred to a junior or a rotating panel.' },
      { step: '04', title: 'Diagnostics on-site', body: 'If ECG, echo, endoscopy or other on-site tests are needed, most can be done the same day without a separate lab visit.' },
    ],
  },
  faq: {
    items: [
      { q: 'Do I need an appointment?', a: 'Appointments are recommended so you get a confirmed slot with the right specialist. Walk-ins are accepted subject to availability — call ahead on busy days.' },
      { q: 'Which doctor should I see?', a: 'Call our front desk at 8888 797 624 and describe your symptoms. We will guide you to cardiology, ENT, orthopaedics, neurology or gynaecology. When in doubt, a phone call saves a wasted trip.' },
      { q: 'What are the neurology OPD timings?', a: 'Dr. Pranit Khandait sees patients in the evening OPD from 7:00 PM to 9:00 PM, Monday to Saturday. Other departments run morning and evening slots — call to confirm for the day you plan to visit.' },
      { q: 'Is parking available?', a: 'Street parking for two-wheelers is available at the gate. Four-wheeler parking is limited on Manewada Ring Road — we recommend auto or two-wheeler where possible.' },
      { q: 'Do you accept health insurance?', a: 'Please check with the front desk at the time of your visit regarding cashless or reimbursement policies for your specific insurer and procedure.' },
      { q: 'Can I book for a family member?', a: 'Yes. When booking online, enter the patient\'s name and phone number. For children or elderly relatives, you may use your own phone number for confirmation.' },
    ],
  },
  diagnostics: {
    items: [
      { name: 'ECG', dept: 'Cardiology', desc: 'Instant heart rhythm recording during your cardiac visit.' },
      { name: '2D-ECHO', dept: 'Cardiology', desc: 'Ultrasound imaging of heart structure and function.' },
      { name: 'TMT', dept: 'Cardiology', desc: 'Treadmill stress test for exercise-related symptoms.' },
      { name: 'Endoscopy', dept: 'ENT', desc: 'Nasal and sinus endoscopy for chronic ENT conditions.' },
      { name: 'Hearing Evaluation', dept: 'ENT', desc: 'Assessment and hearing-aid fitting on referral.' },
    ],
  },
};

export function allCmsSections() {
  return Object.entries(CMS_DEFAULTS).map(([key, content]) => ({ key, content }));
}
