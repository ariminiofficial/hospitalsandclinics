import {
  CLINIC as FALLBACK_CLINIC,
  DEPARTMENTS as FALLBACK_DEPARTMENTS,
  FALLBACK_TESTIMONIALS,
  ABOUT,
  WHY_CARDS,
  VISIT_STEPS,
  FAQ,
  ON_SITE_DIAGNOSTICS,
} from './clinicData.js';

function deptIdForDoctor(doctor) {
  const spec = (doctor.specialization || '').toLowerCase();
  if (spec.includes('cardio')) return 'heart';
  if (spec.includes('ent')) return 'ent';
  if (spec.includes('ortho')) return 'ortho';
  if (spec.includes('neuro')) return 'neuro';
  if (spec.includes('gynae') || spec.includes('gynec')) return 'gynae';
  const lastName = doctor.full_name?.split(' ').pop()?.toLowerCase();
  return FALLBACK_DEPARTMENTS.find((d) => d.name.toLowerCase().includes(lastName))?.id;
}

export function parsePhone(phoneStr = '') {
  const digits = String(phoneStr).replace(/\D/g, '');
  const local = digits.startsWith('91') && digits.length > 10 ? digits.slice(-10) : digits.slice(-10);
  if (local.length !== 10) {
    return {
      phone: FALLBACK_CLINIC.phone,
      phoneDisplay: FALLBACK_CLINIC.phoneDisplay,
      whatsapp: FALLBACK_CLINIC.whatsapp,
    };
  }
  return {
    phone: local,
    phoneDisplay: `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`,
    whatsapp: `91${local}`,
  };
}

function pick(obj = {}, defaults = {}) {
  const out = { ...defaults };
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

export function buildClinic(contact = {}) {
  const phone = parsePhone(contact.phone || FALLBACK_CLINIC.phone);
  const address = contact.address || FALLBACK_CLINIC.address;
  return {
    ...FALLBACK_CLINIC,
    ...phone,
    name: contact.clinicName || FALLBACK_CLINIC.name,
    tagline: contact.tagline || FALLBACK_CLINIC.tagline,
    email: contact.email || FALLBACK_CLINIC.email,
    address,
    ribbon: address,
    hours: contact.hours || 'Mon–Sat · Call ahead to confirm specialist timing',
    landmark: contact.landmark || FALLBACK_CLINIC.landmark,
    neuroTiming: contact.neuroTiming || 'Evening OPD · 7:00 PM – 9:00 PM',
    generalTiming: contact.generalTiming || 'Monday – Saturday · Morning & evening OPD slots',
    parking: contact.parking || 'Two-wheeler parking available at the gate.',
    directionsFrom: contact.directionsFrom || '',
    whatToBring: contact.whatToBring || 'Previous medical reports, current medicines, valid ID.',
  };
}

export function mergeDepartments(apiDoctors = []) {
  if (!apiDoctors.length) return FALLBACK_DEPARTMENTS;

  const byId = Object.fromEntries(
    apiDoctors.map((doc) => [deptIdForDoctor(doc), doc]).filter(([id]) => id)
  );

  return FALLBACK_DEPARTMENTS.map((dept) => {
    const doc = byId[dept.id];
    if (!doc) return dept;
    const lastName = doc.full_name?.split(' ').pop();
    return {
      ...dept,
      doctorId: doc.id,
      name: doc.full_name || dept.name,
      shortName: lastName ? `Dr. ${lastName}` : dept.shortName,
      cred: doc.qualification || dept.cred,
      bio: doc.bio?.length > dept.bio?.length ? doc.bio : (doc.bio || dept.bio),
      fee: doc.consultation_fee ? `From ₹${doc.consultation_fee}` : dept.fee,
      role: doc.specialization ? `${doc.specialization} specialist` : dept.role,
    };
  });
}

const DEFAULTS = {
  hero: {
    title: 'One address. Five specialists who talk to each other.',
    subtitle: 'Infinity Clinics — Omkar Nagar, Nagpur',
    ctaText: 'Book Online',
    ctaLink: '/book',
    lede: 'Infinity Clinics brings a cardiologist, an ENT surgeon, an orthopaedic surgeon, a neurologist and a gynaecologist into a single Omkar Nagar practice — so your reports, your history and your treatment plan don\'t get lost between waiting rooms.',
  },
  about: {
    eyebrow: 'About Infinity Clinics',
    title: ABOUT.headline,
    lede: ABOUT.lede,
    body: '',
    story: ABOUT.story,
    values: ABOUT.values,
    whyTitle: 'What makes Infinity Clinics different.',
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
};

export function buildWebsiteState({ content = {}, doctors = [], services = [], testimonials = [] } = {}) {
  const clinic = buildClinic(content.contact);
  const about = pick(content.about, DEFAULTS.about);
  if (!about.story?.length) about.story = ABOUT.story;
  if (!about.values?.length) about.values = ABOUT.values;

  return {
    clinic,
    hero: pick(content.hero, DEFAULTS.hero),
    about,
    home: pick(content.home, DEFAULTS.home),
    pages: {
      doctors: pick(content.doctors_page, DEFAULTS.doctors_page),
      services: pick(content.services_page, DEFAULTS.services_page),
      contact: pick(content.contact_page, DEFAULTS.contact_page),
      testimonials: pick(content.testimonials_page, DEFAULTS.testimonials_page),
      book: pick(content.book_page, DEFAULTS.book_page),
    },
    whyCards: content.why_cards?.items?.length ? content.why_cards.items : WHY_CARDS,
    visitSteps: content.visit_steps?.items?.length ? content.visit_steps.items : VISIT_STEPS,
    faq: content.faq?.items?.length ? content.faq.items : FAQ,
    diagnostics: content.diagnostics?.items?.length ? content.diagnostics.items : ON_SITE_DIAGNOSTICS,
    cta: pick(content.cta, DEFAULTS.cta),
    footer: pick(content.footer, DEFAULTS.footer),
    departments: mergeDepartments(doctors),
    doctors,
    services: services.length ? services : null,
    testimonials: testimonials.length ? testimonials : FALLBACK_TESTIMONIALS,
  };
}
