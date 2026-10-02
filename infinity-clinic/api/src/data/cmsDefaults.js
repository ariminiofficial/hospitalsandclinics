/** Default website_content sections — seeded into DB and mirrored as web fallbacks */

export const CMS_DEFAULTS = {
  hero: {
    title: 'One address. Five specialists who talk to each other.',
    subtitle: 'Pulse Multi-Specialty Clinic — City Centre',
    lede: 'Pulse Multi-Specialty Clinic brings a cardiologist, an ENT surgeon, an orthopaedic surgeon, a neurologist, and a gynaecologist into a single collaborative practice — so your reports, history, and treatment plans stay connected.',
    ctaText: 'Book Appointment',
    ctaLink: '/book',
  },
  about: {
    eyebrow: 'About Pulse Clinic',
    title: 'A multi-specialty medical centre built around patient care.',
    lede: 'Pulse Multi-Specialty Clinic brings together experienced consultants, modern diagnostics, and synchronized care under one roof for families across the city.',
    body: 'A multi-specialty practice on Central Avenue, Metro Health Park — cardiology, ENT, orthopaedics, neurology, and gynaecology under one roof.',
    story: [
      'At Metro Health Park on Central Avenue, five distinct specialist practices share one modern facility and one unified front desk. Each department is led by a named specialist with post-graduate credentials in their field.',
      'That integrated structure matters when families deal with multiple health needs at the same time. Cardiac follow-ups, pediatric ENT visits, and orthopaedic consultations can all be handled in the same location without misplaced records or scattered appointments.',
      'We equipped our centre with on-site diagnostics — ECG, 2D-ECHO, TMT for cardiac care; endoscopy and hearing evaluations for ENT — so routine diagnostic tests are completed promptly during your visit.',
    ],
    values: [
      { title: 'Transparency', body: 'Every department clearly lists the doctor\'s credentials, qualification, and fee schedule before you consult.' },
      { title: 'Accessibility', body: 'Convenient ground-level access, patient parking, online booking, and dedicated evening OPD slots for working professionals.' },
      { title: 'Continuity', body: 'Your consultations, prescriptions, and follow-ups stay with your chosen specialist across every visit.' },
    ],
    whyTitle: 'What makes Pulse Multi-Specialty Clinic different.',
  },
  contact: {
    clinicName: 'Pulse Multi-Specialty Clinic',
    tagline: 'Metro Health Park · City Centre',
    phone: '+91 98765 43210',
    email: 'contact@pulseclinic.demo',
    address: 'Plot No. 42, Metro Health Park, Central Avenue, City Centre – 400001',
    hours: 'Mon–Sat: timings vary by department — please call ahead',
    landmark: 'Opposite Metro Central Station, Beside City Medical Arcade',
    neuroTiming: 'Evening OPD · 7:00 PM – 9:00 PM',
    generalTiming: 'Monday – Saturday · Morning & evening OPD slots',
    parking: 'Dedicated parking available for two-wheelers and patient cars at the front entrance.',
    directionsFrom: 'Located on Central Avenue at Metro Health Park, directly opposite Metro Central Station.',
    whatToBring: 'Previous medical reports, list of current medicines, and valid photo ID. First-time patients: arrive 10 minutes early for registration.',
  },
  home: {
    specialistsEyebrow: 'Our Specialists',
    specialistsTitle: 'Five named doctors. Five departments.',
    specialistsDesc: 'Each department at Pulse Multi-Specialty Clinic is led by an experienced specialist consultant.',
    servicesEyebrow: 'Services & Diagnostics',
    servicesTitle: 'Tests and consultations on the same visit.',
    servicesDesc: 'ECG, 2D-ECHO, TMT, endoscopy, and more — available on-site so you receive timely evaluations.',
    whyEyebrow: 'Why Pulse Clinic',
    whyTitle: 'Comprehensive care designed for modern families.',
    whyDesc: 'Cardiac health, joint pain, ENT concerns, and specialist follow-ups — managed seamlessly in one centre.',
    storiesEyebrow: 'Patient Stories',
    storiesTitle: 'Trusted by patients and families.',
    locationEyebrow: 'Find Us',
    locationTitle: 'Central Avenue, Metro Health Park',
    locationDesc: 'Convenient access opposite Metro Central Station with dedicated patient parking.',
  },
  doctors_page: {
    eyebrow: 'Our Specialists',
    title: 'Five departments, five named specialists',
    lede: 'Every department at Pulse Multi-Specialty Clinic is led by a dedicated specialist with post-graduate credentials — DM Cardiology, DM Neurology, fellowship-trained orthopaedics, MS ENT, and MD Gynaecology.',
    calloutTitle: 'Not sure which specialist you need?',
    calloutBody: 'Describe your symptoms to our front desk — we will guide you to the appropriate department.',
  },
  services_page: {
    eyebrow: 'What We Treat',
    title: 'Services & diagnostics by department',
    lede: 'From cardiac diagnostics to arthroscopy, ENT endoscopy to high-risk pregnancy care — comprehensive treatments and diagnostics available under one roof.',
    diagnosticsEyebrow: 'On-Site Diagnostics',
    diagnosticsTitle: 'Tests done on the same day as your visit.',
    diagnosticsDesc: 'Prompt on-site cardiac and ENT diagnostic facilities save you unnecessary travel and waiting time.',
    feeNoteTitle: 'Consultation fees are indicative',
    feeNoteBody: 'Final charges depend on the consultation type and any procedures or diagnostics performed during your visit. Contact the front desk for current fee schedules.',
    ctaTitle: 'Need help choosing a service?',
    ctaSubtitle: 'Call our helpdesk and we will connect you with the right specialist.',
  },
  contact_page: {
    eyebrow: 'Contact & Visit',
    title: 'Find us at Metro Health Park',
    lede: 'One front desk number for all five departments. Call, WhatsApp, or book online — located on Central Avenue.',
    timingsTitle: 'When to visit each specialist.',
    directionsTitle: 'Directions & parking.',
    firstVisitTitle: 'What happens when you arrive.',
    faqTitle: 'Common questions.',
  },
  testimonials_page: {
    eyebrow: 'Patient Stories',
    title: 'What patients say about Pulse Clinic',
    lede: 'Feedback from patients across cardiology, ENT, orthopaedics, neurology, and gynaecology.',
    calloutTitle: 'Visited us recently?',
    calloutBody: 'We appreciate every patient who shares their experience. Your feedback helps other families find the right care.',
    ctaTitle: 'Experience it yourself',
    ctaSubtitle: 'Book an appointment with the specialist who fits your needs — or call our front desk.',
  },
  book_page: {
    eyebrow: 'Online Booking',
    title: 'Book an appointment',
    lede: 'Select your specialist, pick a convenient date and time, and confirm your visit. Prefer to book by phone? Call our reception desk directly.',
    hoursNote: 'Mon–Sat · Neurology evenings 7–9 PM',
    successNote: 'We\'ll confirm your slot by phone. For urgent assistance, reach out directly via call.',
  },
  cta: {
    title: 'Not sure which doctor you need?',
    subtitle: 'Call our front desk — one number connects you to the right department.',
  },
  footer: {
    tagline: 'A multi-specialty medical practice on Central Avenue, Metro Health Park — five departments, one front desk.',
    disclaimer: 'Timings vary by department — please call ahead to confirm slot availability.',
  },
  why_cards: {
    items: [
      { num: '01 — Continuity', title: 'Shared address, shared context', body: 'Consult your cardiologist and orthopaedic specialist in the same facility with unified records and coordinated care.' },
      { num: '02 — Credentials', title: 'Dedicated specialists, not general duty rotations', body: 'Each department is headed by a qualified consultant with advanced post-graduate qualifications.' },
      { num: '03 — On-site diagnostics', title: 'ECG, 2D-ECHO, TMT & endoscopy in-house', body: 'Key diagnostic evaluations happen during your consultation visit for faster clinical decisions.' },
      { num: '04 — One front desk', title: 'A single number for all five departments', body: 'Call 9876 543 210 to schedule appointments, inquire about timings, or book online anytime.' },
    ],
  },
  visit_steps: {
    items: [
      { step: '01', title: 'Call or book online', body: 'Reach us at 9876 543 210 or use our web portal to choose your department and preferred slot.' },
      { step: '02', title: 'Arrive with basics', body: 'Bring prior medical records, medication list, and a photo ID. New patients: please arrive 10 minutes early.' },
      { step: '03', title: 'Consult your specialist', body: 'Meet directly with your designated consultant doctor for a thorough evaluation.' },
      { step: '04', title: 'Diagnostics on-site', body: 'Complete recommended ECG, echo, or endoscopy tests on the same day without outside referrals.' },
    ],
  },
  faq: {
    items: [
      { q: 'Do I need an appointment?', a: 'Appointments are recommended for minimal wait times. Walk-ins are accepted based on daily slot availability.' },
      { q: 'Which doctor should I see?', a: 'Contact our front desk at 9876 543 210 to describe your symptoms and get directed to cardiology, ENT, orthopaedics, neurology, or gynaecology.' },
      { q: 'What are the neurology OPD timings?', a: 'Dr. Ananya Sen conducts evening neurology OPD from 7:00 PM to 9:00 PM, Monday to Saturday. Other departments operate morning and afternoon slots.' },
      { q: 'Is parking available?', a: 'Yes, on-site parking is available for both two-wheelers and four-wheelers at Metro Health Park.' },
      { q: 'Do you accept health insurance?', a: 'Please inquire with our billing desk regarding cashless network tie-ups and reimbursement documentation.' },
      { q: 'Can I book for a family member?', a: 'Yes. Enter the patient\'s name during booking, and you can provide your own contact number for confirmation updates.' },
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
