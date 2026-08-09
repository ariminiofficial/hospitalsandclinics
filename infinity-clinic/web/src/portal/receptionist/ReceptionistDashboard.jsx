import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/client.js';
import { useQueueSocket } from '../../shared/realtime/useQueueSocket.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import SectionIntro from '../shared/SectionIntro.jsx';
import AppointmentTable from './AppointmentTable.jsx';
import Modal from '../../shared/components/Modal.jsx';
import DetailDl from '../shared/DetailDl.jsx';
import { PAGE_HELP, METRIC_HELP, SECTION_HELP } from '../shared/portalHelp.js';
import { APPOINTMENT_STATUS_OPTIONS, matchesSearch, TOKEN_STATUS_OPTIONS } from '../shared/portalSearch.js';

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [queue, setQueue] = useState([]);
  const [apptSearch, setApptSearch] = useState('');
  const [apptStatus, setApptStatus] = useState('all');
  const [queueSearch, setQueueSearch] = useState('');
  const [queueStatus, setQueueStatus] = useState('all');
  const [viewPatient, setViewPatient] = useState(null);

  const load = async () => {
    const [appts, docs] = await Promise.all([
      api.get('/portal/opd/today'),
      api.get('/public/website/doctors'),
    ]);
    setAppointments(appts);
    setDoctors(docs);
    if (docs.length > 0 && !selectedDoctor) setSelectedDoctor(docs[0].id);
  };

  useEffect(() => { load().catch(console.error); }, []);

  useQueueSocket(selectedDoctor, setQueue);

  useEffect(() => {
    if (selectedDoctor) {
      api.get(`/portal/opd/queue/${selectedDoctor}`).then(setQueue).catch(() => setQueue([]));
    }
  }, [selectedDoctor]);

  const filteredAppts = useMemo(() => appointments.filter((a) => {
    const statusOk = apptStatus === 'all' || a.status === apptStatus;
    const searchOk = matchesSearch(apptSearch, a.patient_name, a.patient_phone, a.doctor_name, a.notes);
    return statusOk && searchOk;
  }), [appointments, apptSearch, apptStatus]);

  const filteredQueue = useMemo(() => queue.filter((t) => {
    const statusOk = queueStatus === 'all' || t.status === queueStatus;
    const searchOk = matchesSearch(queueSearch, t.patient_name, t.token_number);
    return statusOk && searchOk;
  }), [queue, queueSearch, queueStatus]);

  const pending = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status)).length;
  const checkedIn = appointments.filter((a) => ['checked_in', 'in_consultation'].includes(a.status)).length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.receptionistDashboard.title}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        description={PAGE_HELP.receptionistDashboard.description}
      >
        <div className="page-header-actions">
          <Link to="/portal/receptionist/walk-in" className="btn btn-primary">+ Walk-in</Link>
          <Link to="/portal/receptionist/appointments" className="btn btn-ghost">All Appointments</Link>
        </div>
      </PortalHeader>

      <div className="metrics-grid">
        <MetricCard value={appointments.length} label={METRIC_HELP.todayTotal.label} description={METRIC_HELP.todayTotal.description} />
        <MetricCard value={pending} label={METRIC_HELP.awaitingCheckIn.label} description={METRIC_HELP.awaitingCheckIn.description} />
        <MetricCard value={checkedIn} label={METRIC_HELP.inClinic.label} description={METRIC_HELP.inClinic.description} />
        <MetricCard value={completed} label={METRIC_HELP.completedToday.label} description={METRIC_HELP.completedToday.description} />
      </div>

      <div className="portal-two-panel">
        <section className="portal-panel">
          <SectionIntro title={SECTION_HELP.todayAppointments.title} description={SECTION_HELP.todayAppointments.description} />
          <PortalToolbar
            search={apptSearch}
            onSearchChange={setApptSearch}
            searchPlaceholder="Search patient, phone, doctor..."
            statusFilter={apptStatus}
            onStatusChange={setApptStatus}
            statusOptions={APPOINTMENT_STATUS_OPTIONS}
            resultCount={filteredAppts.length}
            totalCount={appointments.length}
          />
          <AppointmentTable
            appointments={filteredAppts}
            onRefresh={load}
            emptyMessage={appointments.length ? 'No matches for your search.' : undefined}
          />
        </section>

        <section className="portal-panel portal-panel-side">
          <div className="section-header-row">
            <SectionIntro title={SECTION_HELP.liveQueue.title} description={SECTION_HELP.liveQueue.description} />
            <select className="portal-select" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <div className="bento-side-toolbar">
            <input
              type="search"
              className="search-input"
              placeholder="Search patient or token..."
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
            />
            <select
              className="portal-select"
              value={queueStatus}
              onChange={(e) => setQueueStatus(e.target.value)}
              title={TOKEN_STATUS_OPTIONS.find((o) => o.value === queueStatus)?.hint}
            >
              {TOKEN_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="queue-list">
            {filteredQueue.map((t) => (
              <div key={t.id} className="queue-item">
                <div className="token-badge">#{t.token_number}</div>
                <div className="queue-item-body">
                  <strong>{t.patient_name}</strong>
                  <p className="text-body-sm">{t.appointment_time?.slice(0, 5)}</p>
                </div>
                <StatusBadge status={t.status} />
                {t.patient_id && (
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewPatient(t)}>View</button>
                )}
              </div>
            ))}
            {filteredQueue.length === 0 && (
              <p className="text-body-sm panel-empty-msg">
                {queue.length ? 'No matches in queue.' : 'No tokens in queue for this doctor.'}
              </p>
            )}
          </div>
        </section>
      </div>

      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient in Queue">
        {viewPatient && (
          <>
            <DetailDl
              items={[
                { label: 'Patient', value: viewPatient.patient_name },
                { label: 'Token', value: `#${viewPatient.token_number}` },
                { label: 'Appointment time', value: viewPatient.appointment_time?.slice(0, 5) },
                { label: 'Queue status', value: <StatusBadge status={viewPatient.status} /> },
              ]}
            />
            <div className="modal-footer-actions">
              <Link to="/portal/receptionist/patients" className="btn btn-primary btn-sm" onClick={() => setViewPatient(null)}>Open Patients</Link>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewPatient(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
