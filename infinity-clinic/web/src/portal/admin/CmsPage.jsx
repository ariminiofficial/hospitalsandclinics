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
const ABOUT_JSON_KEYS = ['story', 'values'];

const CONTENT_TABS = {
  pages: ['hero', 'about', 'doctors_page', 'services_page', 'contact_page', 'testimonials_page', 'book_page'],
  site: ['home', 'contact', 'cta', 'footer'],
  lists: ['why_cards', 'visit_steps', 'faq', 'diagnostics'],
};

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
        {section === 'about' && ABOUT_JSON_KEYS.map((key) => (
          <label key={key}>
            {key} (JSON array)
            <textarea
              className="json-editor"
              rows={6}
              value={JSON.stringify(data[key] || [], null, 2)}
              onChange={(e) => {
                try {
                  onChange({ ...data, [key]: JSON.parse(e.target.value) });
                } catch { /* ignore while typing */ }
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function JsonSectionEditor({ section, data, onChange }) {
  return (
    <div className="cms-section-card">
      <h3 className="section-title">{section.replace(/_/g, ' ')}</h3>
      <p className="text-body-sm">Edit as JSON. Use <code>items</code> array.</p>
      <textarea
        className="json-editor"
        rows={12}
        value={JSON.stringify(data, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch { /* ignore while typing */ }
        }}
      />
    </div>
  );
}

export default function CmsPage() {
  const [tab, setTab] = useState('pages');
  const [content, setContent] = useState({});
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm());
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm());
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
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
    await api.post('/portal/admin/cms/services', serviceForm);
    setServiceForm(emptyServiceForm());
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
        {['pages', 'site', 'lists', 'services', 'testimonials'].map((t) => (
          <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
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
            <h3 className="section-title">Add Service</h3>
            <label>Title<input value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} required /></label>
            <label>Description<textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} rows={2} /></label>
            <label>Icon<input value={serviceForm.icon} onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })} placeholder="heart, ent, ortho…" /></label>
            <button type="submit" className="btn btn-primary">Add Service</button>
          </form>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Title</th><th>Description</th><th>Order</th><th>Actions</th></tr></thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.title}</strong></td>
                    <td className="text-body-sm">{s.description}</td>
                    <td>{s.sort_order}</td>
                    <td className="actions-cell row-actions">
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewService(s)}>View</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => api.delete(`/portal/admin/cms/services/${s.id}`).then(load)}>Delete</button>
                    </td>
                  </tr>
                ))}
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
                    <td>{'★'.repeat(t.rating || 5)}</td>
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

      <Modal open={!!viewService} onClose={() => setViewService(null)} title="Service Details">
        {viewService && (
          <>
            <DetailDl items={[
              { label: 'Title', value: viewService.title },
              { label: 'Description', value: viewService.description },
              { label: 'Icon', value: viewService.icon || '—' },
              { label: 'Sort order', value: viewService.sort_order },
            ]} />
            <div className="modal-footer-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewService(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!viewTestimonial} onClose={() => setViewTestimonial(null)} title="Testimonial Details">
        {viewTestimonial && (
          <>
            <DetailDl items={[
              { label: 'Patient', value: viewTestimonial.patient_name },
              { label: 'Rating', value: '★'.repeat(viewTestimonial.rating || 5) },
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
