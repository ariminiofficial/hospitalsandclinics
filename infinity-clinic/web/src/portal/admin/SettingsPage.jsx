import { useEffect, useState } from 'react';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';

function parseSetting(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val.replace(/^"|"$/g, '');
  return String(val);
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    clinicName: '',
    clinicPhone: '',
    clinicEmail: '',
    clinicAddress: '',
    slotDuration: 15,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/portal/admin/settings'),
      api.get('/portal/admin/cms/content'),
    ]).then(([settings, contentRows]) => {
      const contact = contentRows.find((r) => r.section_key === 'contact')?.content || {};
      setForm({
        clinicName: parseSetting(settings.clinic_name) || 'Infinity Clinics',
        clinicPhone: parseSetting(settings.clinic_phone) || contact.phone?.replace(/\D/g, '').slice(-10) || '',
        clinicEmail: contact.email || '',
        clinicAddress: parseSetting(settings.clinic_address) || contact.address || '',
        slotDuration: settings.appointment_slot_duration || 15,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await Promise.all([
        api.put('/portal/admin/settings/clinic_name', { value: form.clinicName }),
        api.put('/portal/admin/settings/clinic_phone', { value: form.clinicPhone }),
        api.put('/portal/admin/settings/clinic_address', { value: form.clinicAddress }),
        api.put('/portal/admin/settings/appointment_slot_duration', { value: form.slotDuration }),
        api.put('/portal/admin/cms/content/contact', {
          content: {
            clinicName: form.clinicName,
            tagline: 'Omkar Nagar · Nagpur',
            phone: form.clinicPhone ? `+91 ${form.clinicPhone.slice(0, 4)} ${form.clinicPhone.slice(4, 7)} ${form.clinicPhone.slice(7)}` : '',
            email: form.clinicEmail,
            address: form.clinicAddress,
            hours: 'Mon–Sat: timings vary by department — please call ahead',
          },
        }),
      ]);
      setMessage('Settings saved. Contact section on the website has been updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="portal-page">Loading settings…</div>;

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.adminSettings.title}
        subtitle={PAGE_HELP.adminSettings.subtitle}
        description={PAGE_HELP.adminSettings.description}
      />

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form className="form card portal-form-card settings-form" onSubmit={save}>
        <fieldset className="settings-fieldset">
          <legend>Clinic Identity</legend>
          <label>Clinic Name<input value={form.clinicName} onChange={(e) => setForm({ ...form, clinicName: e.target.value })} required /></label>
          <label>Phone (10 digits)<input value={form.clinicPhone} onChange={(e) => setForm({ ...form, clinicPhone: e.target.value })} maxLength={15} /></label>
          <label>Email<input type="email" value={form.clinicEmail} onChange={(e) => setForm({ ...form, clinicEmail: e.target.value })} /></label>
          <label>Address<textarea value={form.clinicAddress} onChange={(e) => setForm({ ...form, clinicAddress: e.target.value })} rows={3} /></label>
        </fieldset>

        <fieldset className="settings-fieldset">
          <legend>Booking</legend>
          <label>Default Slot Duration (minutes)
            <input type="number" min={5} max={60} value={form.slotDuration} onChange={(e) => setForm({ ...form, slotDuration: Number(e.target.value) })} />
          </label>
          <p className="text-body-sm">Used when generating appointment slots from doctor_schedules.slot_duration_minutes.</p>
        </fieldset>

        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
