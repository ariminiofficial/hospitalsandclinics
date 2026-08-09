import { Link } from 'react-router-dom';
import Modal from '../../shared/components/Modal.jsx';
import StatusBadge from './StatusBadge.jsx';
import DetailDl from './DetailDl.jsx';

export default function AppointmentDetailModal({ appointment, onClose, patientLinkPrefix }) {
  if (!appointment) return null;

  const patientLink = appointment.patient_id && patientLinkPrefix
    ? `${patientLinkPrefix}/${appointment.patient_id}`
    : null;

  return (
    <Modal open onClose={onClose} title="Appointment Details">
      <DetailDl
        items={[
          { label: 'Patient', value: patientLink ? <Link to={patientLink}>{appointment.patient_name}</Link> : appointment.patient_name },
          { label: 'Phone', value: appointment.patient_phone },
          { label: 'Doctor', value: appointment.doctor_name },
          { label: 'Date', value: appointment.appointment_date },
          { label: 'Time', value: appointment.appointment_time?.slice(0, 5) },
          { label: 'Status', value: <StatusBadge status={appointment.status} /> },
          { label: 'Booked via', value: appointment.booked_via?.replace(/_/g, ' ') },
          { label: 'Consultation fee', value: appointment.consultation_fee != null ? `₹${appointment.consultation_fee}` : null },
          { label: 'Notes', value: appointment.notes || '—' },
        ]}
      />
      <div className="modal-footer-actions">
        {patientLink && (
          <Link to={patientLink} className="btn btn-primary btn-sm">View Patient</Link>
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
