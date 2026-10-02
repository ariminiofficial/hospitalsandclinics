import { useEffect, useState } from 'react';
import { api } from '../../shared/api/client.js';

export default function PaymentReceipt({ appointmentId, onClose }) {
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    api.get(`/portal/payments/${appointmentId}/receipt`).then(setReceipt).catch(console.error);
  }, [appointmentId]);

  if (!receipt) return <p>Loading receipt...</p>;

  const handlePrint = () => window.print();
  const services = Array.isArray(receipt.services) ? receipt.services : [];

  return (
    <div className="receipt print-area">
      <div className="receipt-header">
        <h2>{typeof receipt.clinic_name === 'string' ? receipt.clinic_name.replace(/"/g, '') : 'Pulse Multi-Specialty Clinic'}</h2>
        <p>{receipt.contact?.address}</p>
        <p>{receipt.contact?.phone}</p>
      </div>
      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Payment Receipt / Tax Invoice</h3>
        <span className="badge badge-primary">PAID</span>
      </div>
      <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '12px 0' }}>
        <p><strong>Patient:</strong> {receipt.patient_name} ({receipt.patient_phone})</p>
        <p><strong>Doctor:</strong> {receipt.doctor_name}</p>
        <p><strong>Date &amp; Time:</strong> {receipt.appointment_date} {receipt.appointment_time?.slice(0, 5)}</p>
        <p><strong>Payment Method:</strong> {receipt.method?.replace(/_/g, ' ').toUpperCase()}</p>
      </div>

      <table className="table" style={{ margin: '16px 0', border: '1px solid var(--border-subtle, #e2e8f0)' }}>
        <thead>
          <tr style={{ background: 'var(--bg-muted, #f1f5f9)' }}>
            <th>#</th>
            <th>Item / Service Description</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Rate (₹)</th>
            <th style={{ textAlign: 'right' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>Doctor Consultation ({receipt.doctor_name})</strong></td>
            <td style={{ textAlign: 'center' }}>1</td>
            <td style={{ textAlign: 'right' }}>{Number(receipt.consultation_fee || 0).toLocaleString('en-IN')}</td>
            <td style={{ textAlign: 'right' }}>{Number(receipt.consultation_fee || 0).toLocaleString('en-IN')}</td>
          </tr>
          {services.map((s, idx) => (
            <tr key={s.id || idx}>
              <td>{idx + 2}</td>
              <td>
                <strong>{s.service_name || s.serviceName}</strong>
                {s.notes && <span className="text-body-sm text-muted" style={{ display: 'block' }}>{s.notes}</span>}
              </td>
              <td style={{ textAlign: 'center' }}>{s.quantity || 1}</td>
              <td style={{ textAlign: 'right' }}>{Number(s.price || 0).toLocaleString('en-IN')}</td>
              <td style={{ textAlign: 'right' }}>{((Number(s.price) || 0) * (Number(s.quantity) || 1)).toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 'bold', fontSize: '1.1em', background: 'var(--bg-muted, #f8fafc)' }}>
            <td colSpan={4} style={{ textAlign: 'right' }}>Total Amount Paid:</td>
            <td style={{ textAlign: 'right', color: 'var(--primary, #0284c7)' }}>₹{Number(receipt.amount || 0).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>

      <p className="text-body-sm text-muted"><strong>Paid at:</strong> {new Date(receipt.paid_at || receipt.created_at).toLocaleString('en-IN')}</p>
      <div className="no-print" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-primary" onClick={handlePrint}>Print Receipt</button>
        {onClose && <button className="btn btn-secondary" onClick={onClose}>Close</button>}
      </div>
    </div>
  );
}
