import { useEffect, useState } from 'react';
import { api } from '../../shared/api/client.js';
import { emptyPatientForm } from '../../shared/schema/index.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import FieldLabel from '../shared/FieldLabel.jsx';
import Modal from '../../shared/components/Modal.jsx';
import VisitDetailModal from '../shared/VisitDetailModal.jsx';
import { PAGE_HELP, FIELD_HELP } from '../shared/portalHelp.js';

export default function PatientsPage() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(emptyPatientForm());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [viewVisit, setViewVisit] = useState(null);

  useEffect(() => {
    if (query.length >= 2) {
      api.get(`/portal/patients/search?q=${encodeURIComponent(query)}`).then(setPatients).catch(console.error);
    } else {
      setPatients([]);
    }
  }, [query]);

  const selectPatient = async (p) => {
    setSelected(p);
    const h = await api.get(`/portal/patients/${p.id}/history`);
    setHistory(h);
  };

  const openEditFor = (p) => {
    setSelected(p);
    setForm({
      phone: p.phone,
      fullName: p.full_name,
      email: p.email || '',
      dateOfBirth: p.date_of_birth?.slice(0, 10) || '',
      gender: p.gender || '',
      address: p.address || '',
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      phone: form.phone,
      fullName: form.fullName,
      email: form.email,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender,
      address: form.address,
    };
    if (editing && selected) {
      const updated = await api.put(`/portal/patients/${selected.id}`, payload);
      setShowForm(false);
      setEditing(false);
      selectPatient(updated);
      setQuery(updated.phone);
    } else {
      const created = await api.post('/portal/patients', payload);
      setShowForm(false);
      selectPatient(created);
      setQuery(created.phone);
    }
  };

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.receptionistPatients.title}
        subtitle={PAGE_HELP.receptionistPatients.subtitle}
        description={PAGE_HELP.receptionistPatients.description}
      >
        <button type="button" className="btn btn-primary" onClick={() => { setForm(emptyPatientForm()); setEditing(false); setShowForm(true); }}>Add Patient</button>
      </PortalHeader>

      <PortalToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name or phone (min 2 chars)..."
      />

      <div className="two-col">
        <div>
          {patients.map((p) => (
            <div key={p.id} className={`list-item list-item-with-actions ${selected?.id === p.id ? 'active' : ''}`}>
              <button type="button" className="list-item-main" onClick={() => selectPatient(p)}>
                <strong>{p.full_name}</strong>
                <span className="text-body-sm">{p.phone}</span>
              </button>
              <div className="row-actions">
                <button type="button" className="btn btn-sm btn-outline" onClick={() => selectPatient(p)}>View</button>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEditFor(p)}>Edit</button>
              </div>
            </div>
          ))}
          {query.length >= 2 && patients.length === 0 && <p className="text-body-sm">No patients found.</p>}
        </div>
        <div>
          {selected ? (
            <div className="card">
              <div className="page-header" style={{ marginBottom: 16 }}>
                <h3>{selected.full_name}</h3>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEditFor(selected)}>Edit</button>
              </div>
              <p><FieldLabel title={FIELD_HELP.phone.title} hint={FIELD_HELP.phone.hint} />{selected.phone}</p>
              <p><FieldLabel title={FIELD_HELP.email.title} hint={FIELD_HELP.email.hint} />{selected.email || '—'}</p>
              <p><FieldLabel title={FIELD_HELP.dobGender.title} hint={FIELD_HELP.dobGender.hint} />{selected.date_of_birth?.slice(0, 10) || '—'} / {selected.gender || '—'}</p>
              <p><FieldLabel title={FIELD_HELP.address.title} hint={FIELD_HELP.address.hint} />{selected.address || '—'}</p>
              <h4 className="section-title" style={{ marginTop: 24 }}>Visit History</h4>
              {history.map((h) => (
                <div key={h.id} className="history-item list-item-with-actions">
                  <div className="list-item-main">
                    <span>{h.appointment_date} {h.appointment_time?.slice(0, 5)}</span>
                    <span className="text-body-sm">{h.doctor_name}</span>
                    <StatusBadge status={h.status} />
                  </div>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewVisit(h)}>View</button>
                </div>
              ))}
              {history.length === 0 && <p className="text-body-sm">No visits yet.</p>}
            </div>
          ) : (
            <div className="card"><p className="text-body-sm">Select a patient to view details and history.</p></div>
          )}
        </div>
      </div>

      <VisitDetailModal visit={viewVisit} onClose={() => setViewVisit(null)} patientLinkPrefix={null} />

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(false); }} title={editing ? 'Edit Patient' : 'Add Patient'}>
        <form onSubmit={handleSubmit} className="form">
          <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={15} /></label>
          <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Date of Birth<input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></label>
          <label>Gender<input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} maxLength={20} /></label>
          <label>Address<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></label>
          <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Create Patient'}</button>
        </form>
      </Modal>
    </div>
  );
}
