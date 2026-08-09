import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../shared/api/client.js';
import { useWebsite } from './WebsiteContext.jsx';
import PageHero from './components/PageHero.jsx';

const STEPS = ['Doctor', 'Date', 'Time', 'Details', 'Done'];

function Calendar({ value, onChange }) {
  const [view, setView] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const monthName = new Date(view.year, view.month).toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = []; for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3 className="text-headline-sm">{monthName}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => setView((v) => ({ ...v, month: v.month - 1 }))}>‹</button>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => setView((v) => ({ ...v, month: v.month + 1 }))}>›</button>
        </div>
      </div>
      <div className="calendar-grid">
        {['S','M','T','W','T','F','S'].map((d) => <div key={d} className="calendar-day-label">{d}</div>)}
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = new Date(view.year, view.month, day).toISOString().split('T')[0];
          const disabled = new Date(view.year, view.month, day) < today;
          return (
            <button key={day} type="button" className={`calendar-day ${value === dateStr ? 'selected' : ''}`}
              disabled={disabled} onClick={() => onChange(dateStr)}>{day}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookPage() {
  const { clinic, visitSteps, doctors: contextDoctors, pages } = useWebsite();
  const page = pages.book;
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState(contextDoctors);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    doctorId: searchParams.get('doctor') || '',
    appointmentDate: '', appointmentTime: '',
    phone: '', fullName: '', email: '',
  });

  useEffect(() => {
    if (contextDoctors.length) setDoctors(contextDoctors);
  }, [contextDoctors]);

  useEffect(() => {
    if (searchParams.get('doctor')) setStep(1);
  }, [searchParams]);

  useEffect(() => {
    if (form.doctorId && form.appointmentDate) {
      api.get(`/public/appointments/doctors/${form.doctorId}/slots?date=${form.appointmentDate}`)
        .then((d) => setSlots(d.slots)).catch(() => setSlots([]));
    } else setSlots([]);
  }, [form.doctorId, form.appointmentDate]);

  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  const handleSubmit = async () => {
    setError('');
    try {
      await api.post('/public/appointments', {
        doctorId: form.doctorId, appointmentDate: form.appointmentDate, appointmentTime: form.appointmentTime,
        patient: { phone: form.phone, fullName: form.fullName, email: form.email },
      });
      setStep(4);
    } catch (err) { setError(err.message); }
  };

  if (step === 4) {
    return (
      <div className="page-inner wrap">
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h1>Appointment Confirmed</h1>
          <p className="lede" style={{ margin: '16px auto' }}>
            {selectedDoctor?.full_name} · {form.appointmentDate} at {form.appointmentTime}
          </p>
          <p className="text-body-sm" style={{ marginBottom: 24 }}>{page.successNote.replace('the number below', clinic.phoneDisplay)}</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lede={page.lede}
      >
        <p className="text-body-sm reveal" style={{ marginTop: 12 }}>
          <a href={`tel:+91${clinic.phone}`}>{clinic.phoneDisplay}</a> · {page.hoursNote}
        </p>
      </PageHero>
      <div className="page-inner wrap">
        <div className="booking-layout">
          <div className="booking-wizard">
        <div className="booking-steps">
          {STEPS.slice(0, 4).map((_, i) => (
            <div key={i} className={`booking-step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="doctor-picker-list">
            {doctors.map((doc) => (
              <div key={doc.id} className="card doctor-picker-card"
                onClick={() => { setForm({ ...form, doctorId: doc.id }); setStep(1); }}>
                <div className="plaque-name doctor-picker-name">{doc.full_name}</div>
                <div className="text-body-sm">{doc.specialization}</div>
                <div className="doctor-picker-fee">₹{doc.consultation_fee}</div>
              </div>
            ))}
            {doctors.length === 0 && <p>No doctors available online yet. Please call <a href={`tel:+91${clinic.phone}`}>{clinic.phoneDisplay}</a>.</p>}
          </div>
        )}

        {step === 1 && (
          <>
            <p className="text-body-sm" style={{ marginBottom: 16 }}>Dr. {selectedDoctor?.full_name}</p>
            <Calendar value={form.appointmentDate} onChange={(d) => setForm({ ...form, appointmentDate: d })} />
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
              {form.appointmentDate && <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Continue</button>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-label">Selected date</p>
            <p className="text-headline-sm" style={{ color: 'var(--teal)', marginBottom: 16 }}>
              {new Date(form.appointmentDate + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="slot-grid">
              {slots.map((s) => (
                <button key={s} type="button" className={`slot-btn ${form.appointmentTime === s ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, appointmentTime: s })}>{s}</button>
              ))}
              {slots.length === 0 && <p className="text-body-sm">No slots available. Try another date or call us.</p>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              {form.appointmentTime && <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {error && <div className="alert-error">{error}</div>}
            <form className="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
              <label>Phone<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
              <label>Email (optional)<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <div className="card" style={{ background: 'var(--paper)' }}>
                <p className="text-label">Summary</p>
                <p><strong>{selectedDoctor?.full_name}</strong></p>
                <p className="text-body-sm">{form.appointmentDate} at {form.appointmentTime}</p>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn btn-primary">Confirm Booking</button>
              </div>
            </form>
          </>
        )}
          </div>

          <div className="booking-sidebar reveal">
            <h3 className="text-headline-sm">What to expect</h3>
            <ol className="booking-expect-list">
              {visitSteps.map((s) => (
                <li key={s.step}><strong>{s.title}</strong> — {s.body}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
