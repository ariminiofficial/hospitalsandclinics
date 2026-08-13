import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../shared/api/client.js';
import { doctorQs, useDoctorScope } from './useDoctorScope.jsx';
import { formatFrequency } from '../../shared/schema/prescription.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import BackButton from '../shared/BackButton.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import FieldLabel from '../shared/FieldLabel.jsx';
import { FIELD_HELP } from '../shared/portalHelp.js';
import PrescriptionPrint from './PrescriptionPrint.jsx';

function formatRxLine(item) {
  const timing = {
    morning: item.timing_morning,
    afternoon: item.timing_afternoon,
    evening: item.timing_evening,
    night: item.timing_night,
  };
  const dose = item.dose || item.dosage;
  const freq = item.frequency || formatFrequency(item.times_per_day, timing);
  return [dose, freq, item.duration].filter(Boolean).join(' · ');
}

function VisitCard({ visit, onPrint }) {
  const items = Array.isArray(visit.prescription_items) ? visit.prescription_items : [];

  return (
    <div className="visit-card card">
      <div className="visit-card-header">
        <div>
          <strong>{visit.appointment_date} {visit.appointment_time?.slice(0, 5)}</strong>
          <p className="text-body-sm">{visit.doctor_name}</p>
        </div>
        <StatusBadge status={visit.status} />
      </div>

      {(visit.chief_complaint || visit.diagnosis) && (
        <div className="visit-card-notes">
          {visit.chief_complaint && <p><FieldLabel title={FIELD_HELP.chiefComplaint.title} hint={FIELD_HELP.chiefComplaint.hint} /> {visit.chief_complaint}</p>}
          {visit.diagnosis && <p><FieldLabel title={FIELD_HELP.diagnosis.title} hint={FIELD_HELP.diagnosis.hint} /> {visit.diagnosis}</p>}
        </div>
      )}

      {items.length > 0 ? (
        <div className="visit-card-rx">
          <div className="visit-card-rx-head">
            <FieldLabel title="Prescription" hint="Medicines prescribed during this visit." />
            <div className="row-actions">
              {visit.prescription_id && (
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => onPrint(visit.prescription_id)}>
                  Print Rx
                </button>
              )}
            </div>
          </div>
          <ul className="rx-summary-list">
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.medicine_name}</strong>
                <span>{formatRxLine(item)}</span>
                {item.instructions && <em>{item.instructions}</em>}
              </li>
            ))}
          </ul>
          {visit.prescription_advice && <p className="text-body-sm"><strong>Advice:</strong> {visit.prescription_advice}</p>}
        </div>
      ) : (
        <p className="visit-no-rx text-body-sm">
          {visit.consultation_id || visit.status === 'completed'
            ? 'No medicines prescribed for this visit.'
            : 'Prescription not recorded yet.'}
        </p>
      )}
    </div>
  );
}

export default function DoctorPatientDetailPage() {
  const { patientId } = useParams();
  const { doctorId } = useDoctorScope();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [printId, setPrintId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const historyQs = doctorId ? `mine=1&${doctorQs(doctorId)}` : 'mine=1';
    Promise.all([
      api.get(`/portal/patients/${patientId}`),
      api.get(`/portal/patients/${patientId}/history?${historyQs}`),
    ])
      .then(([p, h]) => {
        setPatient(p);
        setHistory(h);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patientId, doctorId]);

  if (printId) {
    return <PrescriptionPrint prescriptionId={printId} onClose={() => setPrintId(null)} />;
  }

  if (loading) return <div className="portal-page">Loading...</div>;
  if (!patient) return <div className="portal-page"><p>Patient not found.</p></div>;

  return (
    <div className="portal-page">
      <PortalHeader title={patient.full_name} subtitle="Demographics and your past consultations with this patient">
        <BackButton fallback="/portal/doctor/patients" />
      </PortalHeader>

      <div className="patient-profile-grid">
        <div className="card patient-profile-card">
          <h3 className="text-headline-sm">Profile</h3>
          <dl className="profile-dl">
            <div><dt>Phone</dt><dd>{patient.phone}</dd></div>
            <div><dt>Email</dt><dd>{patient.email || '—'}</dd></div>
            <div><dt>Date of birth</dt><dd>{patient.date_of_birth?.slice(0, 10) || '—'}</dd></div>
            <div><dt>Gender</dt><dd>{patient.gender || '—'}</dd></div>
            <div><dt>Address</dt><dd>{patient.address || '—'}</dd></div>
          </dl>
        </div>

        <div className="patient-visits">
          <h3 className="text-headline-sm">Your visits ({history.length})</h3>
          {history.map((visit) => (
            <VisitCard key={visit.appointment_id} visit={visit} onPrint={setPrintId} />
          ))}
          {history.length === 0 && (
            <div className="card card-muted">
              <p className="text-body-sm">No consultations with this patient yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
