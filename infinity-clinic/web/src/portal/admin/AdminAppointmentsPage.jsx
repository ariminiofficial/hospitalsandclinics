import { useEffect, useMemo, useState } from 'react';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import AppointmentDetailModal from '../shared/AppointmentDetailModal.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';
import { APPOINTMENT_STATUS_OPTIONS, matchesSearch } from '../shared/portalSearch.js';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorId, setDoctorId] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [viewAppointment, setViewAppointment] = useState(null);

  useEffect(() => {
    api.get('/portal/admin/doctors').then(setDoctors).catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ date });
    if (doctorId !== 'all') params.set('doctorId', doctorId);
    if (status !== 'all') params.set('status', status);
    api.get(`/portal/appointments?${params}`).then(setAppointments).catch(console.error);
  }, [date, doctorId, status]);

  const filtered = useMemo(() => appointments.filter((a) => matchesSearch(
    search, a.patient_name, a.patient_phone, a.doctor_name, a.notes, a.booked_via,
  )), [appointments, search]);

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.adminAppointments.title}
        subtitle={PAGE_HELP.adminAppointments.subtitle}
        description={PAGE_HELP.adminAppointments.description}
      />

      <PortalToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient, phone, doctor..."
        statusFilter={status}
        onStatusChange={setStatus}
        statusOptions={APPOINTMENT_STATUS_OPTIONS}
        resultCount={filtered.length}
        totalCount={appointments.length}
      >
        <label className="portal-select-label">
          Date
          <input type="date" className="portal-select" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="portal-select-label">
          Doctor
          <select className="portal-select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="all">All doctors</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </label>
      </PortalToolbar>

      <div className="table-wrap table-wrap--cards">
        <p className="table-mobile-hint">Swipe horizontally on small screens</p>
        <table className="table">
          <thead>
            <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Booked Via</th><th>Notes</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td data-label="Time">{a.appointment_time?.slice(0, 5)}</td>
                <td data-label="Patient">{a.patient_name}<br /><span className="text-body-sm">{a.patient_phone}</span></td>
                <td data-label="Doctor">{a.doctor_name}</td>
                <td data-label="Status"><StatusBadge status={a.status} /></td>
                <td data-label="Booked Via">{a.booked_via}</td>
                <td data-label="Notes" className="text-body-sm">{a.notes || '—'}</td>
                <td data-label="Actions" className="actions-cell">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewAppointment(a)}>View</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} data-label="">{appointments.length ? 'No matches for your search.' : 'No appointments for this filter.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AppointmentDetailModal
        appointment={viewAppointment}
        onClose={() => setViewAppointment(null)}
      />
    </div>
  );
}
