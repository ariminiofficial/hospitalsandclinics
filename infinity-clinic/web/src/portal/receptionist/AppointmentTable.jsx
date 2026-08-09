import { useState } from 'react';
import { api } from '../../shared/api/client.js';
import { emptyPaymentForm, PaymentMethod } from '../../shared/schema/index.js';
import StatusBadge from '../shared/StatusBadge.jsx';
import Modal from '../../shared/components/Modal.jsx';
import AppointmentDetailModal from '../shared/AppointmentDetailModal.jsx';
import PaymentReceipt from './PaymentReceipt.jsx';

export default function AppointmentTable({ appointments, onRefresh, showDoctor = true, emptyMessage, patientLinkPrefix }) {
  const [paymentModal, setPaymentModal] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [viewAppointment, setViewAppointment] = useState(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm());
  const [rescheduleForm, setRescheduleForm] = useState({ appointmentDate: '', appointmentTime: '' });

  if (receiptId) {
    return <PaymentReceipt appointmentId={receiptId} onClose={() => { setReceiptId(null); onRefresh?.(); }} />;
  }

  const handleCheckIn = async (id) => {
    await api.post(`/portal/opd/${id}/check-in`);
    onRefresh?.();
  };

  return (
    <>
      <div className="table-wrap table-wrap--cards">
        <p className="table-mobile-hint">Swipe horizontally to see all columns →</p>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              {showDoctor && <th>Doctor</th>}
              <th>Status</th>
              <th>Via</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td data-label="Time">{a.appointment_time?.slice(0, 5)}</td>
                <td data-label="Patient">
                  {a.patient_name}
                  <br /><span className="text-body-sm">{a.patient_phone}</span>
                </td>
                {showDoctor && <td data-label="Doctor">{a.doctor_name}</td>}
                <td data-label="Status"><StatusBadge status={a.status} /></td>
                <td data-label="Via" className="text-body-sm">{a.booked_via || '—'}</td>
                <td data-label="Actions" className="actions-cell">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewAppointment(a)}>View</button>
                  {a.status === 'pending' && (
                    <button className="btn btn-sm btn-secondary" onClick={() => api.patch(`/portal/appointments/${a.id}/confirm`).then(onRefresh)}>Confirm</button>
                  )}
                  {['pending', 'confirmed'].includes(a.status) && (
                    <>
                      <button className="btn btn-sm btn-primary" onClick={() => handleCheckIn(a.id)}>Check In</button>
                      <button className="btn btn-sm btn-outline" onClick={() => { setRescheduleModal(a); setRescheduleForm({ appointmentDate: '', appointmentTime: '' }); }}>Reschedule</button>
                      <button className="btn btn-sm btn-outline" onClick={() => api.patch(`/portal/appointments/${a.id}/no-show`).then(onRefresh)}>No Show</button>
                      <button className="btn btn-sm btn-danger" onClick={() => api.patch(`/portal/appointments/${a.id}/cancel`).then(onRefresh)}>Cancel</button>
                    </>
                  )}
                  {['completed', 'checked_in', 'in_consultation'].includes(a.status) && (
                    <button className="btn btn-sm btn-secondary" onClick={() => { setPaymentModal(a); setPaymentForm({ ...emptyPaymentForm(), amount: a.consultation_fee || '' }); }}>Payment</button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan={showDoctor ? 6 : 5} data-label="">{emptyMessage || 'No appointments found.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AppointmentDetailModal
        appointment={viewAppointment}
        onClose={() => setViewAppointment(null)}
        patientLinkPrefix={patientLinkPrefix}
      />

      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="Record Payment">
        {paymentModal && (
          <form className="form" onSubmit={async (e) => {
            e.preventDefault();
            await api.post(`/portal/payments/${paymentModal.id}/record-offline`, {
              amount: Number(paymentForm.amount),
              method: paymentForm.method,
            });
            setPaymentModal(null);
            setReceiptId(paymentModal.id);
          }}>
            <p>Patient: <strong>{paymentModal.patient_name}</strong></p>
            <p className="text-body-sm">Doctor: {paymentModal.doctor_name}</p>
            <label>Amount (₹)<input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required /></label>
            <label>Method
              <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.CARD_OFFLINE}>Card</option>
                <option value={PaymentMethod.UPI_OFFLINE}>UPI</option>
              </select>
            </label>
            <button type="submit" className="btn btn-primary btn-block">Record &amp; Print Receipt</button>
          </form>
        )}
      </Modal>

      <Modal open={!!rescheduleModal} onClose={() => setRescheduleModal(null)} title="Reschedule Appointment">
        <form className="form" onSubmit={async (e) => {
          e.preventDefault();
          await api.patch(`/portal/appointments/${rescheduleModal.id}/reschedule`, rescheduleForm);
          setRescheduleModal(null);
          onRefresh?.();
        }}>
          <label>New Date<input type="date" value={rescheduleForm.appointmentDate} onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentDate: e.target.value })} required /></label>
          <label>New Time<input type="time" value={rescheduleForm.appointmentTime} onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentTime: e.target.value })} required /></label>
          <button type="submit" className="btn btn-primary btn-block">Reschedule</button>
        </form>
      </Modal>
    </>
  );
}
