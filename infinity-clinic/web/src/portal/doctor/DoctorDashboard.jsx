import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useQueueSocket } from '../../shared/realtime/useQueueSocket.js';
import { api } from '../../shared/api/client.js';
import { DoctorPicker, doctorQs, useDoctorScope } from './useDoctorScope.js';
import { emptyConsultationNotes } from '../../shared/schema/index.js';
import { emptyPrescriptionItem, normalizePrescriptionItem } from '../../shared/schema/prescription.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import PrescriptionPrint from './PrescriptionPrint.jsx';
import PrescriptionForm from './PrescriptionForm.jsx';
import FieldLabel from '../shared/FieldLabel.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import SectionIntro from '../shared/SectionIntro.jsx';
import { PAGE_HELP, METRIC_HELP, FIELD_HELP, SECTION_HELP } from '../shared/portalHelp.js';
import { matchesSearch, TOKEN_STATUS_OPTIONS } from '../shared/portalSearch.js';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { doctorId, doctors, isAdminView, setDoctorId, selectedDoctor } = useDoctorScope();
  const [queue, setQueue] = useState([]);
  const [activeToken, setActiveToken] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [notes, setNotes] = useState(emptyConsultationNotes());
  const [prescription, setPrescription] = useState({ advice: '', items: [emptyPrescriptionItem()] });
  const [showPrint, setShowPrint] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueStatus, setQueueStatus] = useState('all');
  const [completionNote, setCompletionNote] = useState('');

  const queueUrl = doctorId ? `/portal/consultations/queue?${doctorQs(doctorId)}` : null;
  const refreshQueue = () => {
    if (!queueUrl) return Promise.resolve();
    return api.get(queueUrl).then(setQueue);
  };

  useQueueSocket(doctorId, setQueue, { queueUrl: queueUrl || undefined });

  useEffect(() => {
    setActiveToken(null);
    setConsultation(null);
    setCompletionNote('');
    setQueue([]);
  }, [doctorId]);

  const waiting = queue.filter((t) => ['waiting', 'called'].includes(t.status));
  const current = queue.find((t) => t.status === 'in_consultation');

  const filteredQueue = useMemo(() => queue.filter((t) => {
    const statusOk = queueStatus === 'all' || t.status === queueStatus;
    const searchOk = matchesSearch(queueSearch, t.patient_name, t.patient_phone, t.token_number);
    return statusOk && searchOk;
  }), [queue, queueSearch, queueStatus]);

  const handleCall = async (token) => {
    await api.post(`/portal/consultations/tokens/${token.id}/call`);
    refreshQueue();
  };

  const handleSkip = async (token) => {
    await api.post(`/portal/consultations/tokens/${token.id}/skip`);
    if (activeToken?.id === token.id) {
      setActiveToken(null);
      setConsultation(null);
    }
    refreshQueue();
  };

  const handleStart = async (token) => {
    setCompletionNote('');
    const result = await api.post(`/portal/consultations/tokens/${token.id}/start`);
    setActiveToken(token);
    setConsultation(result.consultation);
    setNotes(emptyConsultationNotes());
    setPrescriptionId(null);
    const existing = await api.get(`/portal/prescriptions/consultation/${result.consultation.id}`);
    if (existing) {
      setPrescription({
        advice: existing.advice || '',
        items: existing.items?.length
          ? existing.items.map((i) => normalizePrescriptionItem(i))
          : [emptyPrescriptionItem()],
      });
      setPrescriptionId(existing.id);
    } else {
      setPrescription({ advice: '', items: [emptyPrescriptionItem()] });
    }
    refreshQueue();
  };

  const completeConsultation = async () => {
    await api.put(`/portal/consultations/${consultation.id}`, notes);
    const filledItems = prescription.items.filter((i) => i.medicineName?.trim());
    if (filledItems.length) {
      const rx = await api.post(`/portal/prescriptions/consultation/${consultation.id}`, {
        advice: prescription.advice,
        items: filledItems,
      });
      setPrescriptionId(rx.id);
    }
    await api.post(`/portal/consultations/${consultation.id}/complete`);
    setCompletionNote(
      filledItems.length
        ? 'Visit completed. Prescription sent to pharmacy.'
        : 'Visit completed. No medicines prescribed — pharmacy was not notified.',
    );
    setActiveToken(null);
    setConsultation(null);
    setNotes(emptyConsultationNotes());
    setPrescription({ advice: '', items: [emptyPrescriptionItem()] });
    setPrescriptionId(null);
    refreshQueue();
  };

  if (!doctorId && !isAdminView) {
    return (
      <div className="portal-page">
        <div className="card">
          <h1>Doctor Dashboard</h1>
          <p className="text-body-sm">Your user account is not linked to a doctor profile. Ask admin to create your doctor profile.</p>
        </div>
      </div>
    );
  }

  if (showPrint && prescriptionId) {
    return <PrescriptionPrint prescriptionId={prescriptionId} onClose={() => setShowPrint(false)} />;
  }

  const displayToken = current || activeToken;

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.doctorDashboard.title}
        subtitle={
          selectedDoctor
            ? `${selectedDoctor.full_name} · ${selectedDoctor.specialization || ''}`
            : user.doctorName
              ? `${user.doctorName} · ${user.specialization || ''}`
              : new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })
        }
        description={PAGE_HELP.doctorDashboard.description}
      >
        {isAdminView && <DoctorPicker doctors={doctors} value={doctorId} onChange={setDoctorId} />}
      </PortalHeader>

      {completionNote && <div className="alert-success">{completionNote}</div>}

      <div className="bento-grid">
        <section className="bento-main">
          {displayToken ? (
            <>
              <div className="consultation-header">
                <SectionIntro title={SECTION_HELP.currentPatient.title} description={SECTION_HELP.currentPatient.description} />
                <StatusBadge status="in_consultation" />
              </div>
              <div className="patient-header">
                <div>
                  <h2 className="text-headline-lg">{displayToken.patient_name}</h2>
                  <p className="text-body-sm">{displayToken.patient_phone}</p>
                </div>
                <div className="token-card">
                  <FieldLabel title={FIELD_HELP.token.title} hint={FIELD_HELP.token.hint} />
                  <span className="token-display">#{displayToken.token_number}</span>
                </div>
              </div>

              <div className="two-col" style={{ marginBottom: '1.5rem' }}>
                <div className="card card-muted">
                  <FieldLabel title={FIELD_HELP.chiefComplaint.title} hint={FIELD_HELP.chiefComplaint.hint} />
                  <textarea className="portal-textarea" value={notes.chiefComplaint} onChange={(e) => setNotes({ ...notes, chiefComplaint: e.target.value })} rows={3} />
                </div>
                <div className="card card-muted">
                  <FieldLabel title={FIELD_HELP.diagnosis.title} hint={FIELD_HELP.diagnosis.hint} />
                  <textarea className="portal-textarea" value={notes.diagnosis} onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })} rows={3} />
                </div>
              </div>

              <div className="card card-muted" style={{ marginBottom: '1.5rem' }}>
                <FieldLabel title={FIELD_HELP.clinicalNotes.title} hint={FIELD_HELP.clinicalNotes.hint} />
                <textarea className="portal-textarea" value={notes.notes} onChange={(e) => setNotes({ ...notes, notes: e.target.value })} rows={2} />
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <SectionIntro title={SECTION_HELP.prescription.title} description={SECTION_HELP.prescription.description} />
                <PrescriptionForm value={prescription} onChange={setPrescription} doctorId={doctorId} />
              </div>

              <div className="portal-action-row">
                <button type="button" className="btn btn-primary portal-action-primary" onClick={completeConsultation}>
                  {prescription.items.some((i) => i.medicineName?.trim()) ? 'Complete Visit & Send Rx' : 'Complete Visit (No Rx)'}
                </button>
                {prescriptionId && <button type="button" className="btn btn-secondary" onClick={() => setShowPrint(true)}>Print Rx</button>}
              </div>
              <p className="text-body-sm rx-optional-hint">
                Prescription is optional. If you add no medicines, the visit still completes and pharmacy is not notified.
              </p>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              <p>Call or start a patient from the queue to begin consultation.</p>
            </div>
          )}
        </section>

        <section className="bento-side">
          <div className="bento-side-header">
            <SectionIntro title={SECTION_HELP.opdQueue.title} description={SECTION_HELP.opdQueue.description} />
            <span className="badge">{waiting.length} waiting</span>
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
          <div className="bento-side-body">
            {filteredQueue.map((t) => (
              <div key={t.id} className="queue-item queue-item-flat">
                <div className="token-badge">#{t.token_number}</div>
                <div className="queue-item-body">
                  <strong>{t.patient_name}</strong>
                  <p className="text-body-sm">{t.appointment_time?.slice(0, 5)}</p>
                </div>
                <StatusBadge status={t.status} />
                <div className="actions-cell row-actions">
                  {t.patient_id && (
                    <Link to={`/portal/doctor/patients/${t.patient_id}`} className="btn btn-sm btn-outline">View</Link>
                  )}
                  {t.status === 'waiting' && (
                    <>
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => handleCall(t)}>Call</button>
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => handleStart(t)}>Start</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleSkip(t)}>Skip</button>
                    </>
                  )}
                  {t.status === 'called' && (
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => handleStart(t)}>Start</button>
                  )}
                </div>
              </div>
            ))}
            {filteredQueue.length === 0 && (
              <p className="empty-queue">{queue.length ? 'No matches in queue.' : 'No patients in queue today.'}</p>
            )}
          </div>
        </section>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <MetricCard
            value={queue.filter((t) => t.status === 'completed').length}
            label={METRIC_HELP.queueCompleted.label}
            description={METRIC_HELP.queueCompleted.description}
          />
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-wait">…</div>
          <MetricCard
            value={waiting.length}
            label={METRIC_HELP.queueWaiting.label}
            description={METRIC_HELP.queueWaiting.description}
          />
        </div>
      </div>
    </div>
  );
}
