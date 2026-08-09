import { useEffect, useState } from 'react';
import { api } from '../../shared/api/client.js';

export default function PaymentReceipt({ appointmentId, onClose }) {
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    api.get(`/portal/payments/${appointmentId}/receipt`).then(setReceipt).catch(console.error);
  }, [appointmentId]);

  if (!receipt) return <p>Loading receipt...</p>;

  const handlePrint = () => window.print();

  return (
    <div className="receipt print-area">
      <div className="receipt-header">
        <h2>{typeof receipt.clinic_name === 'string' ? receipt.clinic_name.replace(/"/g, '') : 'Infinity Clinic'}</h2>
        <p>{receipt.contact?.address}</p>
        <p>{receipt.contact?.phone}</p>
      </div>
      <hr />
      <h3>Payment Receipt</h3>
      <p><strong>Patient:</strong> {receipt.patient_name}</p>
      <p><strong>Doctor:</strong> {receipt.doctor_name}</p>
      <p><strong>Date:</strong> {receipt.appointment_date} {receipt.appointment_time?.slice(0, 5)}</p>
      <p><strong>Amount:</strong> ₹{receipt.amount}</p>
      <p><strong>Method:</strong> {receipt.method?.replace('_', ' ')}</p>
      <p><strong>Paid at:</strong> {new Date(receipt.paid_at).toLocaleString()}</p>
      <div className="no-print" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-primary" onClick={handlePrint}>Print</button>
        {onClose && <button className="btn" onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}
