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
  const [form, setForm] = useState(emptyDoctorForm());
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 15 });
  const [search, setSearch] = useState('');

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
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>Add Doctor</button>
      </PortalHeader>

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
                <span className="text-body-sm">{d.specialization}</span>
              </button>
              <div className="row-actions">
                <button type="button" className="btn btn-sm btn-outline" onClick={() => selectDoctor(d.id)}>View</button>
                {!d.is_active && <StatusBadge status="cancelled" />}
              </div>
            </div>
          ))}
        </div>
        <div>
          {selected ? (
            <div className="card">
              <h3>{selected.full_name}</h3>
              <p className="text-body-sm">{selected.email}</p>
              <p>{selected.specialization} · ₹{selected.consultation_fee}</p>
              <p className="text-body-sm">{selected.qualification}</p>
              <p style={{ marginTop: 12 }}>{selected.bio}</p>
              {selected.is_active && (
                <button type="button" className="btn btn-sm btn-danger" style={{ marginTop: 16 }} onClick={() => deactivate(selected.id)}>Deactivate</button>
              )}
              <h4 className="section-title" style={{ marginTop: 24 }}>Weekly Schedule</h4>
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
            <div className="card"><p className="text-body-sm">Select a doctor to view profile and schedule.</p></div>
          )}
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Doctor">
        <form onSubmit={handleCreate} className="form">
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></label>
          <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          <label>Specialization<input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></label>
          <label>Qualification<input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></label>
          <label>Consultation Fee (₹)<input type="number" min={0} value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} /></label>
          <label>Bio<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></label>
          <button type="submit" className="btn btn-primary">Create Doctor</button>
        </form>
      </Modal>
    </div>
  );
}
