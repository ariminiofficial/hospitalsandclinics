import { Link } from 'react-router-dom';
import Modal from '../../shared/components/Modal.jsx';
import StatusBadge from './StatusBadge.jsx';
import DetailDl from './DetailDl.jsx';

export default function VisitDetailModal({ visit, onClose, onPrintRx, patientLinkPrefix = '/portal/doctor/patients' }) {
  if (!visit) return null;

  const items = Array.isArray(visit.prescription_items) ? visit.prescription_items : [];
  const patientLink = visit.patient_id && patientLinkPrefix ? `${patientLinkPrefix}/${visit.patient_id}` : null;

  return (
    <Modal open onClose={onClose} title="Visit Details">
      <DetailDl
        items={[
          { label: 'Patient', value: patientLink ? <Link to={patientLink}>{visit.patient_name}</Link> : visit.patient_name },
          { label: 'Phone', value: visit.patient_phone },
          { label: 'Doctor', value: visit.doctor_name },
          { label: 'Date & time', value: `${visit.appointment_date} ${visit.appointment_time?.slice(0, 5) || ''}`.trim() },
          { label: 'Status', value: <StatusBadge status={visit.appointment_status || visit.status} /> },
          { label: 'Chief complaint', value: visit.chief_complaint || '—' },
          { label: 'Diagnosis', value: visit.diagnosis || '—' },
          { label: 'Clinical notes', value: visit.consultation_notes || visit.notes || '—' },
          { label: 'Payment', value: visit.payment_amount != null ? `₹${visit.payment_amount} (${visit.payment_method || 'recorded'})` : '—' },
        ]}
      />
      {items.length > 0 ? (
        <div className="modal-section">
          <h4 className="text-headline-sm">Prescription</h4>
          <ul className="rx-summary-list">
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.medicine_name}</strong>
                <span>{[item.dose || item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ')}</span>
                {item.instructions && <em>{item.instructions}</em>}
              </li>
            ))}
          </ul>
          {visit.prescription_advice && <p className="text-body-sm"><strong>Advice:</strong> {visit.prescription_advice}</p>}
        </div>
      ) : (
        <p className="visit-no-rx text-body-sm">
          {(visit.consultation_id || visit.appointment_status === 'completed' || visit.status === 'completed')
            ? 'No medicines prescribed for this visit.'
            : 'Prescription not recorded yet.'}
        </p>
      )}
      <div className="modal-footer-actions">
        {patientLink && (
          <Link to={patientLink} className="btn btn-primary btn-sm">View Patient</Link>
        )}
        {visit.prescription_id && onPrintRx && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onPrintRx(visit.prescription_id)}>Print Rx</button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
