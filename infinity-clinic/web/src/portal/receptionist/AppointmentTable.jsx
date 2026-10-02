import { useState, useEffect } from 'react';
import { api } from '../../shared/api/client.js';
import { emptyPaymentForm, PaymentMethod } from '../../shared/schema/index.js';
import StatusBadge from '../shared/StatusBadge.jsx';
import Modal from '../../shared/components/Modal.jsx';
import AppointmentDetailModal from '../shared/AppointmentDetailModal.jsx';
import PaymentReceipt from './PaymentReceipt.jsx';
import ServiceSelector from '../shared/ServiceSelector.jsx';

export default function AppointmentTable({ appointments, onRefresh, showDoctor = true, emptyMessage, patientLinkPrefix }) {
  const [paymentModal, setPaymentModal] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [viewAppointment, setViewAppointment] = useState(null);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm());
  const [paymentServices, setPaymentServices] = useState([]);
  const [rescheduleForm, setRescheduleForm] = useState({ appointmentDate: '', appointmentTime: '' });

  if (receiptId) {
    return <PaymentReceipt appointmentId={receiptId} onClose={() => { setReceiptId(null); onRefresh?.(); }} />;
  }

  const handleCheckIn = async (id) => {
    await api.post(`/portal/opd/${id}/check-in`);
    onRefresh?.();
  };

  const openPaymentModal = async (appointment) => {
    setPaymentModal(appointment);
    let initialServices = Array.isArray(appointment.services) ? appointment.services : [];
    try {
      const fetchedServices = await api.get(`/portal/appointments/${appointment.id}/services`);
      if (Array.isArray(fetchedServices) && fetchedServices.length > 0) {
        initialServices = fetchedServices;
      }
    } catch (e) {
      console.warn('Could not fetch services for appointment', e);
    }

    const mappedServices = initialServices.map((s) => ({
      serviceId: s.service_id || s.serviceId || null,
      serviceName: s.service_name || s.serviceName || s.title || '',
      price: Number(s.price) || 0,
      quantity: Number(s.quantity) || 1,
      notes: s.notes || '',
    }));

    setPaymentServices(mappedServices);
    const doctorFee = Number(appointment.consultation_fee || 0);
    const servicesFee = mappedServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
    setPaymentForm({
      ...emptyPaymentForm(),
      amount: doctorFee + servicesFee,
    });
  };

  const handleServicesChange = (newServices) => {
    setPaymentServices(newServices);
    const doctorFee = Number(paymentModal?.consultation_fee || 0);
    const servicesFee = newServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
    setPaymentForm((f) => ({ ...f, amount: doctorFee + servicesFee }));
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
                    <button className="btn btn-sm btn-secondary" onClick={() => openPaymentModal(a)}>Payment</button>
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

      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="Record Payment & Checkout">
        {paymentModal && (
          <form className="form" onSubmit={async (e) => {
            e.preventDefault();
            await api.post(`/portal/payments/${paymentModal.id}/record-offline`, {
              amount: Number(paymentForm.amount),
              method: paymentForm.method,
              services: paymentServices,
            });
            setPaymentModal(null);
            setReceiptId(paymentModal.id);
          }}>
            <div className="payment-patient-header card card-muted" style={{ padding: '10px 14px', marginBottom: 12 }}>
              <p>Patient: <strong>{paymentModal.patient_name}</strong> ({paymentModal.patient_phone})</p>
              <p className="text-body-sm">
                Doctor: <strong>{paymentModal.doctor_name}</strong> · Consultation Fee: <strong>₹{Number(paymentModal.consultation_fee || 0).toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <ServiceSelector
              value={paymentServices}
              onChange={handleServicesChange}
              title="Add / Verify Clinical Services &amp; Diagnostic Tests"
              hint="Attach diagnostic tests (Sugar, BP, MRI, ECG, X-Ray) or procedures conducted during this visit"
              compact
            />

            <div className="payment-calculation-summary card" style={{ padding: '12px 16px', margin: '14px 0', background: 'var(--bg-elevated, #f8fafc)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Doctor Consultation Fee:</span>
                <strong>₹{Number(paymentModal.consultation_fee || 0).toLocaleString('en-IN')}</strong>
              </div>
              {paymentServices.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: 'var(--text-muted)' }}>
                  <span>+ {s.serviceName} {s.quantity > 1 ? `(×${s.quantity})` : ''}:</span>
                  <span>₹{((Number(s.price) || 0) * (Number(s.quantity) || 1)).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <hr style={{ margin: '8px 0', borderColor: 'var(--border-subtle)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05em' }}>
                <strong>Calculated Total:</strong>
                <strong className="text-primary">
                  ₹{(Number(paymentModal.consultation_fee || 0) + paymentServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0)).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>Amount to Collect (₹)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </label>
              <label>Payment Method
                <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.CARD_OFFLINE}>Card</option>
                  <option value={PaymentMethod.UPI_OFFLINE}>UPI (QR/App)</option>
                </select>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
              Record Payment &amp; Print Receipt (₹{Number(paymentForm.amount || 0).toLocaleString('en-IN')})
            </button>
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
