import { useState } from 'react';
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
    let docFee = Number(appointment.consultation_fee || 0);
    if (!docFee && appointment.doctor_id) {
      try {
        const docs = await api.get('/public/website/doctors');
        const matched = docs.find((d) => d.id === appointment.doctor_id || d.full_name === appointment.doctor_name);
        if (matched?.consultation_fee) {
          docFee = Number(matched.consultation_fee);
        }
      } catch (e) {
        console.warn('Could not fetch doctor fee fallback', e);
      }
    }

    const apptWithFee = { ...appointment, consultation_fee: docFee };
    setPaymentModal(apptWithFee);

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
    const servicesFee = mappedServices.reduce((sum, s) => sum + (Number(s.price) || 0) * (Number(s.quantity) || 1), 0);
    setPaymentForm({
      ...emptyPaymentForm(),
      amount: docFee + servicesFee,
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

      <Modal
        open={!!paymentModal}
        onClose={() => setPaymentModal(null)}
        title={`POS Checkout & Billing — ${paymentModal?.patient_name || ''}`}
        size="xl"
      >
        {paymentModal && (
          <form className="form payment-pos-form" onSubmit={async (e) => {
            e.preventDefault();
            await api.post(`/portal/payments/${paymentModal.id}/record-offline`, {
              amount: Number(paymentForm.amount),
              method: paymentForm.method,
              transactionRef: paymentForm.transactionRef || undefined,
              notes: paymentForm.notes || undefined,
              services: paymentServices,
            });
            setPaymentModal(null);
            setReceiptId(paymentModal.id);
          }}>
            <div className="payment-modal-grid">
              <div className="payment-modal-left">
                <ServiceSelector
                  value={paymentServices}
                  onChange={handleServicesChange}
                  title="Attach Diagnostic Tests &amp; Clinical Services"
                  hint="Select tests conducted (Sugar, BP, ECG, X-Ray, MRI, Nebulization) to add to invoice"
                  compact
                />
              </div>

              <div className="payment-modal-right">
                <div className="payment-patient-header" style={{ padding: '12px 16px', background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>{paymentModal.patient_name}</span>
                    <span className="badge badge-secondary">{paymentModal.appointment_time?.slice(0, 5)}</span>
                  </div>
                  <div className="text-body-sm" style={{ color: 'var(--ink-soft)' }}>
                    Phone: {paymentModal.patient_phone}
                  </div>
                  <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span>Doctor: <strong>{paymentModal.doctor_name}</strong></span>
                    <span style={{ color: 'var(--teal-deep)', fontWeight: 600 }}>Fee: ₹{Number(paymentModal.consultation_fee || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="payment-calculation-summary card" style={{ padding: '14px 16px', background: 'var(--paper-raised)', border: '1.5px solid var(--line)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 8 }}>
                    Invoice Breakdown
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.92rem' }}>
                    <span>Doctor Consultation Fee:</span>
                    <strong>₹{Number(paymentModal.consultation_fee || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  {paymentServices.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: 4 }}>
                      <span>+ {s.serviceName} {s.quantity > 1 ? `(×${s.quantity})` : ''}:</span>
                      <span>₹{((Number(s.price) || 0) * (Number(s.quantity) || 1)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ margin: '10px 0', borderTop: '1px dashed var(--line)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Total Calculated Bill:</span>
                    <strong style={{ color: 'var(--teal-deep)', fontSize: '1.25rem' }}>
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
                      style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--teal-deep)' }}
                      required
                    />
                  </label>
                  <label>Payment Mode
                    <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                      <option value={PaymentMethod.CASH}>Cash</option>
                      <option value={PaymentMethod.UPI_OFFLINE}>UPI / QR Code</option>
                      <option value={PaymentMethod.CARD_OFFLINE}>Card / POS Terminal</option>
                      <option value={PaymentMethod.NET_BANKING}>Net Banking / NEFT</option>
                      <option value={PaymentMethod.INSURANCE}>Insurance / TPA Claim</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  <label>
                    {paymentForm.method === PaymentMethod.UPI_OFFLINE && 'UPI Reference ID / 12-digit UTR Number'}
                    {paymentForm.method === PaymentMethod.CARD_OFFLINE && 'Card Last 4 Digits & POS Slip / Auth Code'}
                    {paymentForm.method === PaymentMethod.NET_BANKING && 'Bank Transfer / IMPS / NEFT Ref Number'}
                    {paymentForm.method === PaymentMethod.INSURANCE && 'Insurance Policy / TPA Pre-Auth Claim ID'}
                    {paymentForm.method === PaymentMethod.CASH && 'Cashier Audit Reference / Denomination Notes (Optional)'}
                    <input
                      type="text"
                      placeholder={
                        paymentForm.method === PaymentMethod.UPI_OFFLINE ? 'e.g., 423981029384' :
                        paymentForm.method === PaymentMethod.CARD_OFFLINE ? 'e.g., Card ending 4582 / Slip #8912' :
                        paymentForm.method === PaymentMethod.INSURANCE ? 'e.g., TPA-ICICI-893214' :
                        paymentForm.method === PaymentMethod.NET_BANKING ? 'e.g., HDFC-NEFT-98312' :
                        'e.g., Received 500x2 notes, change returned'
                      }
                      value={paymentForm.transactionRef || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    />
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ padding: '13px', fontSize: '0.98rem', fontWeight: 600, marginTop: 4 }}>
                  Record Payment &amp; Print Receipt (₹{Number(paymentForm.amount || 0).toLocaleString('en-IN')})
                </button>
              </div>
            </div>
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
