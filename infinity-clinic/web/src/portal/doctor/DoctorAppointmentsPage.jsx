import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import AppointmentDetailModal from '../shared/AppointmentDetailModal.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';
import { APPOINTMENT_STATUS_OPTIONS, matchesSearch } from '../shared/portalSearch.js';
import { DoctorPicker, doctorQs, useDoctorScope } from './useDoctorScope.jsx';

export default function DoctorAppointmentsPage() {
  const { doctorId, doctors, isAdminView, setDoctorId } = useDoctorScope();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewAppointment, setViewAppointment] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setAppointments([]);
      return;
    }
    api.get(`/portal/consultations/today?${doctorQs(doctorId)}`).then(setAppointments).catch(console.error);
  }, [doctorId]);

  const filtered = useMemo(() => appointments.filter((a) => {
    const statusOk = statusFilter === 'all' || a.status === statusFilter;
    const searchOk = matchesSearch(search, a.patient_name, a.patient_phone, a.notes, a.booked_via);
    return statusOk && searchOk;
  }), [appointments, search, statusFilter]);

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.doctorAppointments.title}
        subtitle={PAGE_HELP.doctorAppointments.subtitle}
        description={PAGE_HELP.doctorAppointments.description}
      >
        {isAdminView && <DoctorPicker doctors={doctors} value={doctorId} onChange={setDoctorId} />}
      </PortalHeader>

      <PortalToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient, phone, notes..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={APPOINTMENT_STATUS_OPTIONS}
        resultCount={filtered.length}
        totalCount={appointments.length}
      />

      <div className="table-wrap table-wrap--cards">
        <p className="table-mobile-hint">Swipe horizontally on small screens</p>
        <table className="table">
          <thead>
            <tr><th>Time</th><th>Patient</th><th>Phone</th><th>Status</th><th>Booked Via</th><th>Notes</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td data-label="Time">{a.appointment_time?.slice(0, 5)}</td>
                <td data-label="Patient">
                  {a.patient_id ? (
                    <Link to={`/portal/doctor/patients/${a.patient_id}`}>{a.patient_name}</Link>
                  ) : a.patient_name}
                </td>
                <td data-label="Phone">{a.patient_phone}</td>
                <td data-label="Status"><StatusBadge status={a.status} /></td>
                <td data-label="Booked Via">{a.booked_via}</td>
                <td data-label="Notes" className="text-body-sm">{a.notes || '—'}</td>
                <td data-label="Actions" className="actions-cell row-actions">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewAppointment(a)}>View</button>
                  {a.patient_id && (
                    <Link to={`/portal/doctor/patients/${a.patient_id}`} className="btn btn-sm btn-secondary">Patient</Link>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} data-label="">{appointments.length ? 'No matches for your search.' : 'No appointments scheduled for today.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AppointmentDetailModal
        appointment={viewAppointment}
        onClose={() => setViewAppointment(null)}
        patientLinkPrefix="/portal/doctor/patients"
      />
    </div>
  );
}
