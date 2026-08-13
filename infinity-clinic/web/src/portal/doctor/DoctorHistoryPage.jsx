import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import EmptyState from '../shared/EmptyState.jsx';
import VisitDetailModal from '../shared/VisitDetailModal.jsx';
import PrescriptionPrint from './PrescriptionPrint.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';
import { matchesSearch } from '../shared/portalSearch.js';
import { DoctorPicker, doctorQs, useDoctorScope } from './useDoctorScope.jsx';

export default function DoctorHistoryPage() {
  const { doctorId, doctors, isAdminView, setDoctorId } = useDoctorScope();
  const [history, setHistory] = useState([]);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState('');
  const [viewVisit, setViewVisit] = useState(null);
  const [printId, setPrintId] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      setHistory([]);
      return;
    }
    api.get(`/portal/consultations/history?days=${days}&${doctorQs(doctorId)}`).then(setHistory).catch(console.error);
  }, [days, doctorId]);

  const filtered = useMemo(() => history.filter((h) => matchesSearch(
    search,
    h.patient_name,
    h.patient_phone,
    h.chief_complaint,
    h.diagnosis,
    h.appointment_date,
  )), [history, search]);

  if (printId) {
    return <PrescriptionPrint prescriptionId={printId} onClose={() => setPrintId(null)} />;
  }

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.doctorHistory.title}
        subtitle={PAGE_HELP.doctorHistory.subtitle}
        description={PAGE_HELP.doctorHistory.description}
      >
        {isAdminView && <DoctorPicker doctors={doctors} value={doctorId} onChange={setDoctorId} />}
        <select className="portal-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </PortalHeader>

      <PortalToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient, complaint, diagnosis..."
        resultCount={filtered.length}
        totalCount={history.length}
      />

      <div className="table-wrap table-wrap--cards">
        <p className="table-mobile-hint">Swipe horizontally on small screens</p>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Chief Complaint</th>
              <th>Diagnosis</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.id}>
                <td data-label="Date">{h.appointment_date} {h.appointment_time?.slice(0, 5)}</td>
                <td data-label="Patient">
                  {h.patient_id ? (
                    <Link to={`/portal/doctor/patients/${h.patient_id}`}>{h.patient_name}</Link>
                  ) : h.patient_name}
                  <br /><span className="text-body-sm">{h.patient_phone}</span>
                </td>
                <td data-label="Complaint">{h.chief_complaint || '—'}</td>
                <td data-label="Diagnosis">{h.diagnosis || '—'}</td>
                <td data-label="Status"><StatusBadge status={h.appointment_status} /></td>
                <td data-label="Actions" className="actions-cell row-actions">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewVisit(h)}>View</button>
                  {h.patient_id && (
                    <Link to={`/portal/doctor/patients/${h.patient_id}`} className="btn btn-sm btn-secondary">Patient</Link>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} data-label=""><EmptyState message={history.length ? 'No matches for your search.' : 'No consultations in this period.'} /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <VisitDetailModal
        visit={viewVisit}
        onClose={() => setViewVisit(null)}
        onPrintRx={(id) => { setViewVisit(null); setPrintId(id); }}
      />
    </div>
  );
}
