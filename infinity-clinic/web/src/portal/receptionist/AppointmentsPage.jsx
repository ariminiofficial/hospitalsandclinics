import { useEffect, useMemo, useState } from 'react';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import AppointmentTable from './AppointmentTable.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';
import { APPOINTMENT_STATUS_OPTIONS, matchesSearch } from '../shared/portalSearch.js';

export default function ReceptionistAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => {
    api.get(`/portal/appointments?date=${date}`).then(setAppointments).catch(console.error);
  };

  useEffect(() => { load(); }, [date]);

  const filtered = useMemo(() => appointments.filter((a) => {
    const statusOk = statusFilter === 'all' || a.status === statusFilter;
    const searchOk = matchesSearch(search, a.patient_name, a.patient_phone, a.doctor_name, a.notes);
    return statusOk && searchOk;
  }), [appointments, statusFilter, search]);

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.receptionistAppointments.title}
        subtitle={PAGE_HELP.receptionistAppointments.subtitle}
        description={PAGE_HELP.receptionistAppointments.description}
      />

      <PortalToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient, phone, doctor..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={APPOINTMENT_STATUS_OPTIONS}
        resultCount={filtered.length}
        totalCount={appointments.length}
      >
        <label className="portal-select-label">
          Date
          <input type="date" className="portal-select" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </PortalToolbar>

      <AppointmentTable appointments={filtered} onRefresh={load} emptyMessage={appointments.length ? 'No matches for your search.' : undefined} />
    </div>
  );
}
