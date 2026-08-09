import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/client.js';
import { emptyWalkInForm } from '../../shared/schema/index.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';

export default function WalkInPage() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyWalkInForm());
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/public/website/doctors').then((docs) => {
      setDoctors(docs);
      if (docs.length > 0) setForm((f) => ({ ...f, doctorId: docs[0].id }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const appt = await api.post('/portal/appointments/walk-in', {
        doctorId: form.doctorId,
        patient: { phone: form.phone, fullName: form.fullName },
        notes: form.notes || undefined,
      });
      setSuccess(appt);
      setForm({ ...emptyWalkInForm(), doctorId: form.doctorId });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.receptionistWalkIn.title}
        subtitle={PAGE_HELP.receptionistWalkIn.subtitle}
        description={PAGE_HELP.receptionistWalkIn.description}
      />

      {success && (
        <div className="alert-success">
          Walk-in registered for <strong>{success.appointment_date}</strong> at <strong>{success.appointment_time?.slice(0, 5)}</strong>.
          {' '}Proceed to <Link to="/portal/receptionist">dashboard</Link> to check in and issue token.
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form card portal-form-card">
        <label>Doctor
          <span className="field-label-hint">Which specialist the patient wants to see today.</span>
          <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} required>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name} — {d.specialization}</option>)}
          </select>
        </label>
        <label>Patient Phone
          <span className="field-label-hint">10-digit mobile number — used to find or create their record.</span>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required minLength={10} maxLength={15} /></label>
        <label>Patient Name
          <span className="field-label-hint">Full name as it should appear on the token and prescription.</span>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required minLength={2} /></label>
        <label>Notes
          <span className="field-label-hint">Optional — reason for visit or special instructions for reception.</span>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></label>
        <button type="submit" className="btn btn-primary">Register Walk-in</button>
      </form>
    </div>
  );
}
