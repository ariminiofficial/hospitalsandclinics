import { useEffect, useState } from 'react';
import { api } from '../../shared/api/client.js';
import { emptyServiceForm, emptyTestimonialForm } from '../../shared/schema/index.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import Modal from '../../shared/components/Modal.jsx';
import DetailDl from '../shared/DetailDl.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';

const CONTENT_FORMS = {
  hero: [
    { key: 'title', label: 'Headline' },
    { key: 'subtitle', label: 'Eyebrow / Subtitle' },
    { key: 'lede', label: 'Intro paragraph', multiline: true },
    { key: 'ctaText', label: 'Button Text' },
    { key: 'ctaLink', label: 'Button Link' },
  ],
  about: [
    { key: 'eyebrow', label: 'Page Eyebrow' },
    { key: 'title', label: 'Page Title' },
    { key: 'lede', label: 'Page Intro', multiline: true },
    { key: 'body', label: 'Short summary', multiline: true },
    { key: 'whyTitle', label: 'Why section title' },
  ],
  contact: [
    { key: 'clinicName', label: 'Clinic Name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', multiline: true },
    { key: 'hours', label: 'Hours' },
    { key: 'landmark', label: 'Landmark', multiline: true },
    { key: 'generalTiming', label: 'General OPD timing' },
    { key: 'neuroTiming', label: 'Neurology OPD timing' },
    { key: 'parking', label: 'Parking info', multiline: true },
    { key: 'directionsFrom', label: 'Directions', multiline: true },
    { key: 'whatToBring', label: 'What to bring', multiline: true },
  ],
  home: [
    { key: 'specialistsEyebrow', label: 'Specialists eyebrow' },
    { key: 'specialistsTitle', label: 'Specialists title' },
    { key: 'specialistsDesc', label: 'Specialists description', multiline: true },
    { key: 'servicesEyebrow', label: 'Services eyebrow' },
    { key: 'servicesTitle', label: 'Services title' },
    { key: 'servicesDesc', label: 'Services description', multiline: true },
    { key: 'whyEyebrow', label: 'Why eyebrow' },
    { key: 'whyTitle', label: 'Why title' },
    { key: 'whyDesc', label: 'Why description', multiline: true },
    { key: 'storiesEyebrow', label: 'Stories eyebrow' },
    { key: 'storiesTitle', label: 'Stories title' },
    { key: 'locationEyebrow', label: 'Location eyebrow' },
    { key: 'locationTitle', label: 'Location title' },
    { key: 'locationDesc', label: 'Location description', multiline: true },
  ],
  doctors_page: [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'title', label: 'Title' },
    { key: 'lede', label: 'Intro', multiline: true },
    { key: 'calloutTitle', label: 'Callout title' },
    { key: 'calloutBody', label: 'Callout body', multiline: true },
  ],
  services_page: [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'title', label: 'Title' },
    { key: 'lede', label: 'Intro', multiline: true },
    { key: 'diagnosticsEyebrow', label: 'Diagnostics eyebrow' },
    { key: 'diagnosticsTitle', label: 'Diagnostics title' },
    { key: 'diagnosticsDesc', label: 'Diagnostics description', multiline: true },
    { key: 'feeNoteTitle', label: 'Fee note title' },
    { key: 'feeNoteBody', label: 'Fee note body', multiline: true },
    { key: 'ctaTitle', label: 'CTA title' },
    { key: 'ctaSubtitle', label: 'CTA subtitle', multiline: true },
  ],
  contact_page: [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'title', label: 'Title' },
    { key: 'lede', label: 'Intro', multiline: true },
    { key: 'timingsTitle', label: 'Timings section title' },
    { key: 'directionsTitle', label: 'Directions section title' },
    { key: 'firstVisitTitle', label: 'First visit section title' },
    { key: 'faqTitle', label: 'FAQ section title' },
  ],
  testimonials_page: [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'title', label: 'Title' },
    { key: 'lede', label: 'Intro', multiline: true },
    { key: 'calloutTitle', label: 'Callout title' },
    { key: 'calloutBody', label: 'Callout body', multiline: true },
    { key: 'ctaTitle', label: 'CTA title' },
    { key: 'ctaSubtitle', label: 'CTA subtitle', multiline: true },
  ],
  book_page: [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'title', label: 'Title' },
    { key: 'lede', label: 'Intro', multiline: true },
    { key: 'hoursNote', label: 'Hours note' },
    { key: 'successNote', label: 'Booking success note', multiline: true },
  ],
  cta: [
    { key: 'title', label: 'Default CTA title' },
    { key: 'subtitle', label: 'Default CTA subtitle', multiline: true },
  ],
  footer: [
    { key: 'tagline', label: 'Footer tagline', multiline: true },
    { key: 'disclaimer', label: 'Footer disclaimer' },
  ],
};

const JSON_SECTIONS = ['why_cards', 'visit_steps', 'faq', 'diagnostics'];

const ITEM_SCHEMAS = {
  why_cards: {
    itemLabel: 'reason',
    fields: [
      { key: 'num', label: 'Number', placeholder: '01' },
      { key: 'title', label: 'Title' },
      { key: 'body', label: 'Description', multiline: true },
    ],
    emptyItem: () => ({ num: '', title: '', body: '' }),
  },
  visit_steps: {
    itemLabel: 'step',
    fields: [
      { key: 'step', label: 'Step number', placeholder: '1' },
      { key: 'title', label: 'Title' },
      { key: 'body', label: 'Description', multiline: true },
    ],
    emptyItem: () => ({ step: '', title: '', body: '' }),
  },
  faq: {
    itemLabel: 'question',
    fields: [
      { key: 'q', label: 'Question' },
      { key: 'a', label: 'Answer', multiline: true },
    ],
    emptyItem: () => ({ q: '', a: '' }),
  },
  diagnostics: {
    itemLabel: 'test',
    fields: [
      { key: 'dept', label: 'Department', placeholder: 'Cardiology' },
      { key: 'name', label: 'Test name' },
      { key: 'desc', label: 'Description', multiline: true },
    ],
    emptyItem: () => ({ dept: '', name: '', desc: '' }),
  },
};

const CONTENT_TABS = {
  pages: ['hero', 'about', 'doctors_page', 'services_page', 'contact_page', 'testimonials_page', 'book_page'],
  site: ['home', 'contact', 'cta', 'footer'],
  lists: ['why_cards', 'visit_steps', 'faq', 'diagnostics'],
};

function moveItem(list, index, dir) {
  const next = list.slice();
  const target = index + dir;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function ReorderButtons({ index, count, onMove, onRemove }) {
  return (
    <div className="cms-item-actions">
      <button type="button" className="btn btn-sm btn-outline" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
      <button type="button" className="btn btn-sm btn-outline" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down">↓</button>
      <button type="button" className="btn btn-sm btn-danger" onClick={onRemove}>Remove</button>
    </div>
  );
}

function StoryEditor({ paragraphs, onChange }) {
  const list = paragraphs || [];
  return (
    <label>
      Our story (paragraphs)
      <div className="cms-item-list">
        {list.map((para, i) => (
          <div key={i} className="cms-item-card">
            <textarea
              rows={3}
              value={para}
              placeholder={`Paragraph ${i + 1}`}
              onChange={(e) => onChange(list.map((p, j) => (j === i ? e.target.value : p)))}
            />
            <ReorderButtons
              index={i}
              count={list.length}
              onMove={(dir) => onChange(moveItem(list, i, dir))}
              onRemove={() => onChange(list.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-sm btn-outline" onClick={() => onChange([...list, ''])}>+ Add paragraph</button>
    </label>
  );
}

function ValuesEditor({ values, onChange }) {
  const list = values || [];
  return (
    <label>
      Our values
      <div className="cms-item-list">
        {list.map((v, i) => (
          <div key={i} className="cms-item-card">
            <label>Title<input value={v.title || ''} onChange={(e) => onChange(list.map((it, j) => (j === i ? { ...it, title: e.target.value } : it)))} /></label>
            <label>Description<textarea rows={2} value={v.body || ''} onChange={(e) => onChange(list.map((it, j) => (j === i ? { ...it, body: e.target.value } : it)))} /></label>
            <ReorderButtons
              index={i}
              count={list.length}
              onMove={(dir) => onChange(moveItem(list, i, dir))}
              onRemove={() => onChange(list.filter((_, j) => j !== i))}
            />
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-sm btn-outline" onClick={() => onChange([...list, { title: '', body: '' }])}>+ Add value</button>
    </label>
  );
}

function ContentEditor({ section, data, onChange }) {
  const fields = CONTENT_FORMS[section] || [];
  return (
    <div className="cms-section-card">
      <h3 className="section-title">{section.replace(/_/g, ' ')}</h3>
      <div className="form">
        {fields.map((f) => (
          <label key={f.key}>
            {f.label}
            {f.multiline ? (
              <textarea rows={3} value={data[f.key] || ''} onChange={(e) => onChange({ ...data, [f.key]: e.target.value })} />
            ) : (
              <input value={data[f.key] || ''} onChange={(e) => onChange({ ...data, [f.key]: e.target.value })} />
            )}
          </label>
        ))}
        {section === 'about' && (
          <>
            <StoryEditor paragraphs={data.story} onChange={(story) => onChange({ ...data, story })} />
            <ValuesEditor values={data.values} onChange={(values) => onChange({ ...data, values })} />
          </>
        )}
      </div>
    </div>
  );
}

function JsonSectionEditor({ section, data, onChange }) {
  const schema = ITEM_SCHEMAS[section];
  const items = data?.items || [];

  const updateItem = (index, patch) => {
    onChange({ ...data, items: items.map((it, j) => (j === index ? { ...it, ...patch } : it)) });
  };
  const removeItem = (index) => {
    onChange({ ...data, items: items.filter((_, j) => j !== index) });
  };
  const moveItemAt = (index, dir) => {
    onChange({ ...data, items: moveItem(items, index, dir) });
  };
  const addItem = () => {
    onChange({ ...data, items: [...items, schema.emptyItem()] });
  };

  return (
    <div className="cms-section-card">
      <h3 className="section-title">{section.replace(/_/g, ' ')}</h3>
      <div className="cms-item-list">
        {items.map((item, i) => (
          <div key={i} className="cms-item-card">
            {schema.fields.map((f) => (
              <label key={f.key}>
                {f.label}
                {f.multiline ? (
                  <textarea rows={2} value={item[f.key] || ''} placeholder={f.placeholder} onChange={(e) => updateItem(i, { [f.key]: e.target.value })} />
                ) : (
                  <input value={item[f.key] || ''} placeholder={f.placeholder} onChange={(e) => updateItem(i, { [f.key]: e.target.value })} />
                )}
              </label>
            ))}
            <ReorderButtons index={i} count={items.length} onMove={(dir) => moveItemAt(i, dir)} onRemove={() => removeItem(i)} />
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-sm btn-outline" onClick={addItem}>+ Add {schema.itemLabel}</button>
    </div>
  );
}

export default function CmsPage() {
  const [tab, setTab] = useState('services');
  const [content, setContent] = useState({});
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm());
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm());
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [viewService, setViewService] = useState(null);
  const [viewTestimonial, setViewTestimonial] = useState(null);

  const load = async () => {
    const [c, s, t] = await Promise.all([
      api.get('/portal/admin/cms/content'),
      api.get('/portal/admin/cms/services'),
      api.get('/portal/admin/cms/testimonials'),
    ]);
    const map = {};
    c.forEach((row) => { map[row.section_key] = row.content || {}; });
    setContent(map);
    setServices(s);
    setTestimonials(t);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const saveContent = async (sectionKey) => {
    setSaving(sectionKey);
    setMessage('');
    try {
      await api.put(`/portal/admin/cms/content/${sectionKey}`, { content: content[sectionKey] || {} });
      setMessage(`${sectionKey} saved — changes appear on the public website.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving('');
    }
  };

  const addService = async (e) => {
    e.preventDefault();
    await api.post('/portal/admin/cms/services', {
      ...serviceForm,
      price: Number(serviceForm.price) || 0,
      durationMinutes: Number(serviceForm.durationMinutes) || 15,
    });
    setServiceForm(emptyServiceForm());
    load();
  };

  const updateService = async (e) => {
    e.preventDefault();
    if (!editingService?.id) return;
    await api.put(`/portal/admin/cms/services/${editingService.id}`, {
      ...editingService,
      price: Number(editingService.price) || 0,
      durationMinutes: Number(editingService.duration_minutes || editingService.durationMinutes) || 15,
      sortOrder: Number(editingService.sort_order || editingService.sortOrder) || 0,
      isPublished: editingService.is_published !== false && editingService.isPublished !== false,
      isActive: editingService.is_active !== false && editingService.isActive !== false,
    });
    setEditingService(null);
    load();
  };

  const addTestimonial = async (e) => {
    e.preventDefault();
    await api.post('/portal/admin/cms/testimonials', testimonialForm);
    setTestimonialForm(emptyTestimonialForm());
    load();
  };

  const renderSection = (key) => (
    <div key={key}>
      {JSON_SECTIONS.includes(key) ? (
        <JsonSectionEditor
          section={key}
          data={content[key] || { items: [] }}
          onChange={(data) => setContent({ ...content, [key]: data })}
        />
      ) : (
        <ContentEditor
          section={key}
          data={content[key] || {}}
          onChange={(data) => setContent({ ...content, [key]: data })}
        />
      )}
      <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 12 }} disabled={saving === key} onClick={() => saveContent(key)}>
        {saving === key ? 'Saving…' : `Save ${key}`}
      </button>
    </div>
  );

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.adminCms.title}
        subtitle={PAGE_HELP.adminCms.subtitle}
        description={PAGE_HELP.adminCms.description}
      />

      {message && <div className="alert-success">{message}</div>}

      <div className="tabs">
        {[
          { id: 'services', label: 'Services & Pricing' },
          { id: 'pages', label: 'Page Content' },
          { id: 'site', label: 'Site Sections' },
          { id: 'lists', label: 'FAQ & Lists' },
          { id: 'testimonials', label: 'Testimonials' },
        ].map(({ id, label }) => (
          <button key={id} type="button" className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {CONTENT_TABS[tab] && (
        <div className="cms-content-grid">
          {CONTENT_TABS[tab].map(renderSection)}
        </div>
      )}

      {tab === 'services' && (
        <div>
          <form onSubmit={addService} className="form card portal-form-card" style={{ marginBottom: 24 }}>
            <h3 className="section-title">Add Clinic Service / Diagnostic Test</h3>
            <p className="text-body-sm" style={{ marginBottom: 12 }}>
              Define services (e.g. Sugar test, BP test, MRI, ECG, Consultations, Procedures) with prices for doctor prescription &amp; reception billing.
            </p>
            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <label>Service Title / Test Name
                <input
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Blood Sugar Test, BP Monitoring, MRI Brain, ECG..."
                  required
                />
              </label>
              <label>Price (₹)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </label>
              <label>Category / Department
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                >
                  <option value="Lab & Diagnostics">Lab &amp; Diagnostics (Sugar, CBC, Lipids...)</option>
                  <option value="Vitals & Screening">Vitals &amp; Screening (BP, SpO2, BMI...)</option>
                  <option value="Radiology & Scans">Radiology &amp; Scans (MRI, CT, X-Ray, USG...)</option>
                  <option value="Cardiology">Cardiology (ECG, 2D-ECHO, TMT...)</option>
                  <option value="ENT & Hearing">ENT &amp; Hearing (Endoscopy, Audiometry...)</option>
                  <option value="Procedures">Procedures &amp; Minor OT (Dressing, Injection...)</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="General">General</option>
                </select>
              </label>
              <label>Est. Duration (Minutes)
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={serviceForm.durationMinutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                />
              </label>
            </div>
            <label>Description &amp; Instructions
              <textarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                rows={2}
                placeholder="Brief clinical description, patient preparation instructions, or diagnostic scope..."
              />
            </label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ flex: 1 }}>Icon identifier
                <input
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  placeholder="test, heart, scan, ent, ortho, general..."
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
                <input
                  type="checkbox"
                  checked={serviceForm.isPublished !== false}
                  onChange={(e) => setServiceForm({ ...serviceForm, isPublished: e.target.checked })}
                />
                Published on website
              </label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>+ Add Service</button>
          </form>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.title}</strong></td>
                    <td><span className="badge badge-secondary">{s.category || 'General'}</span></td>
                    <td><strong className="text-primary">₹{Number(s.price || 0).toLocaleString('en-IN')}</strong></td>
                    <td>{s.duration_minutes || s.durationMinutes || 15} mins</td>
                    <td className="text-body-sm" style={{ maxWidth: 260 }}>{s.description || '—'}</td>
                    <td>
                      <span className={`status-pill ${s.is_published !== false ? 'status-pill-confirmed' : 'status-pill-pending'}`}>
                        {s.is_published !== false ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="actions-cell row-actions">
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewService(s)}>View</button>
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => setEditingService({ ...s, durationMinutes: s.duration_minutes || 15, sortOrder: s.sort_order || 0 })}>Edit</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => api.delete(`/portal/admin/cms/services/${s.id}`).then(load)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr><td colSpan={7}>No services configured yet. Add your first service above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'testimonials' && (
        <div>
          <form onSubmit={addTestimonial} className="form card portal-form-card" style={{ marginBottom: 24 }}>
            <h3 className="section-title">Add Testimonial</h3>
            <label>Patient Name<input value={testimonialForm.patientName} onChange={(e) => setTestimonialForm({ ...testimonialForm, patientName: e.target.value })} required /></label>
            <label>Content<textarea value={testimonialForm.content} onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })} rows={3} required /></label>
            <label>Rating (1–5)<input type="number" min={1} max={5} value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })} /></label>
            <button type="submit" className="btn btn-primary">Add Testimonial</button>
          </form>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Patient</th><th>Rating</th><th>Content</th><th>Actions</th></tr></thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id}>
                    <td>{t.patient_name}</td>
                    <td><span className="badge badge-secondary">{t.rating || 5} / 5</span></td>
                    <td className="text-body-sm">{t.content}</td>
                    <td className="actions-cell row-actions">
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewTestimonial(t)}>View</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => api.delete(`/portal/admin/cms/testimonials/${t.id}`).then(load)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!editingService} onClose={() => setEditingService(null)} title="Edit Service & Price" size="lg">
        {editingService && (
          <form className="form" onSubmit={updateService}>
            <label>Service / Test Title
              <input
                value={editingService.title || ''}
                onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                required
              />
            </label>
            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>Price (₹)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editingService.price ?? 0}
                  onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                  required
                />
              </label>
              <label>Department / Category
                <select
                  value={editingService.category || 'General'}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                >
                  <option value="Lab & Diagnostics">Lab &amp; Diagnostics</option>
                  <option value="Vitals & Screening">Vitals &amp; Screening</option>
                  <option value="Radiology & Scans">Radiology &amp; Scans</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="ENT & Hearing">ENT &amp; Hearing</option>
                  <option value="Procedures">Procedures</option>
                  <option value="General Consultation">General Consultation</option>
                  <option value="General">General</option>
                </select>
              </label>
            </div>
            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>Duration (Minutes)
                <input
                  type="number"
                  value={editingService.duration_minutes ?? editingService.durationMinutes ?? 15}
                  onChange={(e) => setEditingService({ ...editingService, duration_minutes: e.target.value })}
                />
              </label>
              <label>Sort Order
                <input
                  type="number"
                  value={editingService.sort_order ?? editingService.sortOrder ?? 0}
                  onChange={(e) => setEditingService({ ...editingService, sort_order: e.target.value })}
                />
              </label>
            </div>
            <label>Clinical Description &amp; Prep Notes
              <textarea
                value={editingService.description || ''}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                rows={3}
              />
            </label>
            <label>Icon Identifier
              <input
                value={editingService.icon || ''}
                onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
              />
            </label>
            <div style={{ display: 'flex', gap: 20, margin: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', fontStyle: 'normal' }}>
                <input
                  type="checkbox"
                  checked={editingService.is_published !== false && editingService.isPublished !== false}
                  onChange={(e) => setEditingService({ ...editingService, is_published: e.target.checked, isPublished: e.target.checked })}
                />
                Published on Public Website
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', fontStyle: 'normal' }}>
                <input
                  type="checkbox"
                  checked={editingService.is_active !== false && editingService.isActive !== false}
                  onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked, isActive: e.target.checked })}
                />
                Active for Doctor/Reception selection
              </label>
            </div>
            <div className="modal-footer-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingService(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!viewService} onClose={() => setViewService(null)} title="Service Details" size="md">
        {viewService && (
          <>
            <DetailDl items={[
              { label: 'Title', value: viewService.title },
              { label: 'Category', value: viewService.category || 'General' },
              { label: 'Price', value: `₹${Number(viewService.price || 0).toLocaleString('en-IN')}` },
              { label: 'Duration', value: `${viewService.duration_minutes || viewService.durationMinutes || 15} minutes` },
              { label: 'Description', value: viewService.description || '—' },
              { label: 'Icon', value: viewService.icon || '—' },
              { label: 'Published', value: viewService.is_published !== false ? 'Yes' : 'No' },
              { label: 'Sort order', value: viewService.sort_order },
            ]} />
            <div className="modal-footer-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewService(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!viewTestimonial} onClose={() => setViewTestimonial(null)} title="Testimonial Details" size="md">
        {viewTestimonial && (
          <>
            <DetailDl items={[
              { label: 'Patient', value: viewTestimonial.patient_name },
              { label: 'Rating', value: `${viewTestimonial.rating || 5} / 5` },
              { label: 'Content', value: viewTestimonial.content },
            ]} />
            <div className="modal-footer-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewTestimonial(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
