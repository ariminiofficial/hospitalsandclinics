import { useEffect, useState, useRef } from 'react';
import { api } from '../../shared/api/client.js';
import { numberToWords } from '../../shared/utils/amountInWords.js';
import { printElement } from '../../shared/utils/printElement.js';

function formatReceiptDate(dateStr) {
  if (!dateStr) return '—';
  const cleanStr = String(dateStr).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }
  return cleanStr;
}

function formatReceiptTime(paidAt, apptTime) {
  if (paidAt) {
    const d = new Date(paidAt);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }
  if (apptTime) {
    const cleanTime = String(apptTime).slice(0, 5);
    return cleanTime;
  }
  return '';
}

export default function PaymentReceipt({ appointmentId, onClose }) {
  const [receipt, setReceipt] = useState(null);
  const docRef = useRef(null);

  useEffect(() => {
    api.get(`/portal/payments/${appointmentId}/receipt`).then(setReceipt).catch(console.error);
  }, [appointmentId]);

  if (!receipt) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tax invoice &amp; receipt...</div>;

  const rawDate = String(receipt.appointment_date || '').split('T')[0].replace(/[^0-9]/g, '');
  const datePrefix = rawDate.slice(0, 8) || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const shortId = (receipt.id || appointmentId || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  const receiptNo = `INV-${datePrefix}-${shortId}`;

  const formattedDate = formatReceiptDate(receipt.appointment_date);
  const formattedTime = formatReceiptTime(receipt.paid_at, receipt.appointment_time);
  const dateTimeDisplay = formattedTime ? `${formattedDate}, ${formattedTime}` : formattedDate;

  const doctorDisplayName = receipt.doctor_name
    ? (receipt.doctor_name.trim().toLowerCase().startsWith('dr')
        ? receipt.doctor_name.trim()
        : `Dr. ${receipt.doctor_name.trim()}`)
    : 'Attending Physician';

  const cashierDisplayName = receipt.recorded_by_name?.includes('@')
    ? `${receipt.recorded_by_name.split('@')[0].toUpperCase()} (Front Desk)`
    : (receipt.recorded_by_name || 'Front Desk Operations');

  const handlePrint = () => {
    if (docRef.current) {
      printElement(docRef.current, `Tax Invoice - ${receiptNo}`);
    } else {
      window.print();
    }
  };

  const services = Array.isArray(receipt.services) ? receipt.services : [];
  const clinicName = typeof receipt.clinic_name === 'string' ? receipt.clinic_name.replace(/"/g, '') : 'Pulse Multi-Specialty Clinic';
  const totalAmount = Number(receipt.amount || 0);
  const consultationFee = Number(receipt.consultation_fee || 0);

  const methodDisplay =
    receipt.method === 'cash' ? 'Cash Payment' :
    receipt.method === 'upi_offline' ? 'UPI / QR Code Transfer' :
    receipt.method === 'card_offline' ? 'Debit/Credit Card (POS Slip)' :
    receipt.method === 'net_banking' ? 'Net Banking / NEFT' :
    receipt.method === 'insurance' ? 'Insurance / TPA Claim' :
    receipt.method === 'razorpay' ? 'Online Payment Gateway' :
    receipt.method?.replace(/_/g, ' ').toUpperCase() || 'Cash';

  return (
    <div className="receipt-modal-wrapper">
      {/* On-Screen Action Bar */}
      <div className="no-print receipt-preview-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>Tax Invoice &amp; Payment Receipt</span>
          <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>Official A4 Document</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
            Print Tax Invoice
          </button>
          {onClose && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Preview
            </button>
          )}
        </div>
      </div>

      {/* High-Fidelity Printable Tax Invoice Document */}
      <div ref={docRef} className="print-document medical-invoice-doc single-page-bill">
        {/* Clinic Letterhead Header */}
        <div className="invoice-header">
          <div className="invoice-header-top">
            <div className="invoice-brand-badge">+</div>
            <div className="invoice-brand-details">
              <h1 className="invoice-clinic-name">{clinicName}</h1>
              <p className="invoice-clinic-tagline">NABH Accredited Multi-Specialty Hospital &amp; Diagnostic Pathology Center</p>
              <p className="invoice-clinic-address">
                {receipt.contact?.address || 'Plot No. 42, Metro Health Park, Central Avenue, City Centre - 400015'} | Tel: {receipt.contact?.phone || '+91 98765 43210'} | Email: billing@pulseclinic.demo
              </p>
              <p className="invoice-clinic-legal">
                <strong>GSTIN:</strong> 27AABCP1234F1Z8 &nbsp;|&nbsp; <strong>Clinical Reg. No:</strong> MH-MED-2024-88421 &nbsp;|&nbsp; <strong>Place of Supply:</strong> Maharashtra (State Code: 27)
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Title & Receipt Ribbon */}
        <div className="invoice-doc-title-bar">
          <div className="invoice-title-text">TAX INVOICE / CASH RECEIPT</div>
          <div className="invoice-title-meta">
            <span className="invoice-copy-badge">ORIGINAL FOR RECIPIENT</span>
          </div>
        </div>

        {/* Patient & Billing Information Cards Grid */}
        <div className="invoice-meta-grid">
          <div className="invoice-meta-card">
            <div className="meta-card-title">Patient Particulars (Billed To)</div>
            <div className="invoice-meta-row">
              <span className="meta-label">Patient Name:</span>
              <span className="meta-value"><strong>{receipt.patient_name}</strong> {receipt.patient_gender ? `(${receipt.patient_gender})` : ''}</span>
            </div>
            <div className="invoice-meta-row">
              <span className="meta-label">Contact Phone:</span>
              <span className="meta-value">{receipt.patient_phone || '—'}</span>
            </div>
            <div className="invoice-meta-row">
              <span className="meta-label">Consulting Doctor:</span>
              <span className="meta-value"><strong>{doctorDisplayName}</strong> {receipt.doctor_specialization ? `(${receipt.doctor_specialization})` : ''}</span>
            </div>
          </div>

          <div className="invoice-meta-card">
            <div className="meta-card-title">Invoice &amp; Payment Particulars</div>
            <div className="invoice-meta-row">
              <span className="meta-label">Invoice / Receipt #:</span>
              <span className="meta-value"><code className="doc-code">{receiptNo}</code></span>
            </div>
            <div className="invoice-meta-row">
              <span className="meta-label">Date &amp; Time of Issue:</span>
              <span className="meta-value"><strong>{dateTimeDisplay}</strong></span>
            </div>
            <div className="invoice-meta-row">
              <span className="meta-label">Payment Method:</span>
              <span className="meta-value">
                <strong>{methodDisplay}</strong>
                <span className="invoice-badge-paid">PAID IN FULL</span>
              </span>
            </div>
            {receipt.transaction_ref && receipt.method !== 'cash' && (
              <div className="invoice-meta-row">
                <span className="meta-label">Ref / UTR / Auth Code:</span>
                <span className="meta-value"><code className="doc-code">{receipt.transaction_ref}</code></span>
              </div>
            )}
            <div className="invoice-meta-row">
              <span className="meta-label">Cashier / Billing Desk:</span>
              <span className="meta-value">{cashierDisplayName}</span>
            </div>
          </div>
        </div>

        {/* Itemized Billing Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: '36px', textAlign: 'center' }}>#</th>
              <th>Particulars / Description of Medical Services &amp; Consultations</th>
              <th style={{ width: '80px', textAlign: 'center' }}>SAC Code</th>
              <th style={{ width: '45px', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '110px', textAlign: 'right' }}>Unit Rate (₹)</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>1</td>
              <td>
                <div style={{ fontWeight: 700 }}>Doctor Outpatient Consultation (OPD)</div>
                <div className="table-subtext">Comprehensive clinical evaluation by {doctorDisplayName}</div>
              </td>
              <td style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b' }}>999312</td>
              <td style={{ textAlign: 'center' }}>1</td>
              <td style={{ textAlign: 'right' }}>{consultationFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{consultationFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>

            {services.map((s, idx) => {
              const unitPrice = Number(s.price || 0);
              const qty = Number(s.quantity || 1);
              const lineTotal = unitPrice * qty;

              return (
                <tr key={s.id || idx}>
                  <td style={{ textAlign: 'center' }}>{idx + 2}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{s.service_name || s.serviceName}</div>
                    {s.notes && <div className="table-subtext">{s.notes}</div>}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b' }}>999312</td>
                  <td style={{ textAlign: 'center' }}>{qty}</td>
                  <td style={{ textAlign: 'right' }}>{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="invoice-subtotal-row">
              <td colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>
                Sub-Total Amount:
              </td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="invoice-tax-row">
              <td colSpan={5} style={{ textAlign: 'right', fontSize: '11.5px', color: '#64748b' }}>
                GST Exemption (Health Care Services - Sl. No. 74, Notif. 12/2017-CT(Rate)):
              </td>
              <td style={{ textAlign: 'right', fontSize: '11.5px', color: '#64748b' }}>
                ₹0.00 (Exempt)
              </td>
            </tr>
            <tr className="invoice-total-row">
              <td colSpan={5} style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.05rem' }}>
                Total Net Amount Received:
              </td>
              <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.15rem', color: '#0c4a44' }}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Amount in Words Box */}
        <div className="invoice-amount-words">
          <span className="words-label">Amount in Words:</span>
          <span className="words-val">Indian Rupees {numberToWords(totalAmount)}</span>
        </div>

        {/* Footer Terms & Signatory Section */}
        <div className="invoice-footer-grid">
          <div className="invoice-terms-box">
            <div className="terms-title">Terms &amp; Statutory Disclosures:</div>
            <ol className="terms-list">
              <li>This document is an official computer-generated Tax Invoice and Payment Receipt.</li>
              <li>Outpatient healthcare and diagnostic services are exempt from Goods &amp; Services Tax (GST).</li>
              <li>Fees paid for consultation and pathological investigations are non-refundable.</li>
              <li>Preserve this invoice for medical insurance claims and tax benefit under Section 80D.</li>
            </ol>
          </div>

          <div className="invoice-sign-box">
            <div className="sign-clinic-header">For {clinicName}</div>
            <div className="sign-spacer" />
            <div className="sign-line">Authorized Billing Signatory</div>
            <div className="sign-clinic">{cashierDisplayName}</div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="invoice-bottom-msg">
          Thank you for choosing {clinicName} • Wishing you good health and a speedy recovery • Computer Generated Invoice
        </div>
      </div>
    </div>
  );
}
