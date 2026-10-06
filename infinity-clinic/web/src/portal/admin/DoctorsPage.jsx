import { useEffect, useMemo, useState } from 'react';
import { api } from '../../shared/api/client.js';
import { emptyDoctorForm } from '../../shared/schema/index.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import Modal from '../../shared/components/Modal.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';
import { matchesSearch } from '../shared/portalSearch.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', specialization: '', qualification: '', consultationFee: 0, bio: '' });
  const [form, setForm] = useState(emptyDoctorForm());
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 15 });
  const [search, setSearch] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => api.get('/portal/admin/doctors').then(setDoctors).catch(console.error);

  useEffect(() => { load(); }, []);

  const filteredDoctors = useMemo(() => doctors.filter((d) => matchesSearch(
    search, d.full_name, d.specialization, d.email, d.qualification,
  )), [doctors, search]);

  const selectDoctor = async (id) => {
    const doc = await api.get(`/portal/admin/doctors/${id}`);
    setSelected(doc);
    setSchedules(doc.schedules || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/portal/admin/doctors', form);
    setShowForm(false);
    setForm(emptyDoctorForm());
    load();
  };

  const openEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setEditForm({
      fullName: doc.full_name || '',
      specialization: doc.specialization || '',
      qualification: doc.qualification || '',
      consultationFee: Number(doc.consultation_fee) || 0,
      bio: doc.bio || '',
    });
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const updated = await api.put(`/portal/admin/doctors/${editingDoctor.id}`, editForm);
      setEditingDoctor(null);
      setMessage(`Updated ${updated.full_name}'s profile and consultation fee to ₹${Number(updated.consultation_fee).toLocaleString('en-IN')}`);
      setTimeout(() => setMessage(''), 4000);
      await load();
      await selectDoctor(editingDoctor.id);
    } catch (err) {
      alert(err.message || 'Failed to update doctor');
    } finally {
      setSavingEdit(false);
    }
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    await api.post(`/portal/admin/doctors/${selected.id}/schedules`, scheduleForm);
    selectDoctor(selected.id);
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this doctor? They will no longer appear for booking.')) return;
    await api.patch(`/portal/admin/doctors/${id}/deactivate`);
    setSelected(null);
    load();
  };

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.adminDoctors.title}
        subtitle={PAGE_HELP.adminDoctors.subtitle}
        description={PAGE_HELP.adminDoctors.description}
      >
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Doctor</button>
      </PortalHeader>

      {message && <div className="alert-success">{message}</div>}

      <PortalToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search doctor, specialization, email..."
        resultCount={filteredDoctors.length}
        totalCount={doctors.length}
      />

      <div className="two-col">
        <div>
          {filteredDoctors.map((d) => (
            <div key={d.id} className={`list-item list-item-with-actions ${selected?.id === d.id ? 'active' : ''}`}>
              <button type="button" className="list-item-main" onClick={() => selectDoctor(d.id)}>
                <strong>{d.full_name}</strong>
                <span className="text-body-sm">{d.specialization} · <strong>₹{Number(d.consultation_fee || 0).toLocaleString('en-IN')}</strong></span>
              </button>
              <div className="row-actions">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEditDoctor(d)}>Edit Fee</button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => selectDoctor(d.id)}>View</button>
                {!d.is_active && <StatusBadge status="cancelled" />}
              </div>
            </div>
          ))}
        </div>
        <div>
          {selected ? (
            <div className="card portal-detail-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>{selected.full_name}</h3>
                  <p className="text-body-sm" style={{ margin: 0 }}>{selected.email}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => openEditDoctor(selected)}>
                    Edit Profile &amp; Fee
                  </button>
                  {selected.is_active && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => deactivate(selected.id)}>
                      Deactivate
                    </button>
                  )}
                </div>
              </div>

              <div className="doctor-fee-banner" style={{ margin: '16px 0', padding: '12px 16px', background: 'var(--dep-heart-soft)', borderRadius: 8, border: '1px solid rgba(20, 99, 86, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="text-label" style={{ color: 'var(--teal-deep)' }}>Consultation Fee</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--teal-deep)' }}>
                    ₹{Number(selected.consultation_fee || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEditDoctor(selected)}>
                  Change Fee
                </button>
              </div>

              <p><strong>Specialty:</strong> {selected.specialization}</p>
              <p className="text-body-sm"><strong>Qualification:</strong> {selected.qualification || '—'}</p>
              <p style={{ marginTop: 12 }}><strong>Bio:</strong> {selected.bio || '—'}</p>

              <h4 className="section-title" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)' }}>Weekly OPD Schedule</h4>
              {schedules.map((s) => (
                <div key={s.id} className="schedule-item">
                  {DAYS[s.day_of_week]} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)} · {s.slot_duration_minutes}min slots
                </div>
              ))}
              {schedules.length === 0 && <p className="text-body-sm">No schedule set.</p>}
              <form onSubmit={addSchedule} className="form inline-form" style={{ marginTop: 16 }}>
                <select value={scheduleForm.dayOfWeek} onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: Number(e.target.value) })}>
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
                <input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} />
                <input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} />
                <button type="submit" className="btn btn-sm btn-primary">Add Slot</button>
              </form>
            </div>
          ) : (
            <div className="card"><p className="text-body-sm">Select a doctor to view profile, consultation fee, and OPD schedule.</p></div>
          )}
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Doctor" size="lg">
        <form onSubmit={handleCreate} className="form">
          <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></label>
          </div>
          <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required placeholder="Dr. Jane Doe" /></label>
            <label>Consultation Fee (₹)
              <input
                type="number"
                min={0}
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                required
              />
            </label>
          </div>
          <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Specialization<input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Cardiology, ENT, etc." /></label>
            <label>Qualification<input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="MBBS, MD, MS" /></label>
          </div>
          <label>Doctor Bio &amp; Clinical Focus
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Experience, credentials, procedures..." />
          </label>
          <button type="submit" className="btn btn-primary btn-block">+ Create Doctor Profile</button>
        </form>
      </Modal>

      <Modal open={!!editingDoctor} onClose={() => setEditingDoctor(null)} title={`Edit Doctor — ${editingDoctor?.full_name}`} size="lg">
        {editingDoctor && (
          <form onSubmit={handleUpdateDoctor} className="form">
            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>Doctor Full Name
                <input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                />
              </label>
              <label style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                <strong style={{ color: '#166534' }}>Consultation Fee (₹) *</strong>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={editForm.consultationFee}
                  onChange={(e) => setEditForm({ ...editForm, consultationFee: Number(e.target.value) })}
                  style={{ fontWeight: 700, fontSize: '1.1rem', borderColor: '#86efac' }}
                  required
                />
              </label>
            </div>
            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>Specialization
                <input
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                />
              </label>
              <label>Qualification
                <input
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                />
              </label>
            </div>
            <label>Bio / Profile
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
              />
            </label>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingEdit}>
                {savingEdit ? 'Saving…' : 'Save Changes & Fee'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingDoctor(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
