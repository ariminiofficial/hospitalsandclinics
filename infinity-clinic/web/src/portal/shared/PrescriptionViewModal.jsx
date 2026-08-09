import Modal from '../../shared/components/Modal.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatFrequency } from '../../shared/schema/prescription.js';
import DetailDl from './DetailDl.jsx';

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

export default function PrescriptionViewModal({ prescription, onClose }) {
  if (!prescription) return null;

  const items = Array.isArray(prescription.items) ? prescription.items : [];
  const status = prescription.pharmacy_status === 'dispensed' ? 'completed'
    : prescription.pharmacy_status === 'dispensing' ? 'in_consultation' : 'waiting';

  return (
    <Modal open onClose={onClose} title="Prescription Details">
      <DetailDl
        items={[
          { label: 'Patient', value: prescription.patient_name },
          { label: 'Phone', value: prescription.patient_phone },
          { label: 'Doctor', value: prescription.doctor_name },
          { label: 'Token', value: prescription.token_number ? `#${prescription.token_number}` : '—' },
          { label: 'Status', value: <StatusBadge status={status} /> },
          { label: 'Dispensed', value: prescription.dispensed_at ? new Date(prescription.dispensed_at).toLocaleString('en-IN') : '—' },
        ]}
      />
      <div className="modal-section">
        <h4 className="text-headline-sm">Medicines</h4>
        <ul className="rx-summary-list">
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.medicine_name}</strong>
              <span>{formatRxLine(item)}</span>
              {item.instructions && <em>{item.instructions}</em>}
            </li>
          ))}
        </ul>
        {prescription.advice && <p className="text-body-sm"><strong>Advice:</strong> {prescription.advice}</p>}
      </div>
      <div className="modal-footer-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
