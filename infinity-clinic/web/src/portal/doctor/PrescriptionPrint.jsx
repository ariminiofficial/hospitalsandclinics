import { useEffect, useState, useRef } from 'react';
import { api } from '../../shared/api/client.js';
import { formatFrequency } from '../../shared/schema/prescription.js';
import { printElement } from '../../shared/utils/printElement.js';

export default function PrescriptionPrint({ prescriptionId, onClose }) {
  const [data, setData] = useState(null);
  const docRef = useRef(null);

  useEffect(() => {
    api.get(`/portal/prescriptions/${prescriptionId}/print`).then(setData).catch(console.error);
  }, [prescriptionId]);

  if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading prescription...</div>;

  const clinicName = typeof data.clinic_name === 'string' ? data.clinic_name.replace(/"/g, '') : 'Pulse Multi-Specialty Clinic';
  
  const doctorDisplayName = data.doctor_name
    ? (data.doctor_name.trim().toLowerCase().startsWith('dr')
        ? data.doctor_name.trim()
        : `Dr. ${data.doctor_name.trim()}`)
    : 'Attending Physician';

  const formattedDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const handlePrint = () => {
    if (docRef.current) {
      printElement(docRef.current, `Prescription - ${data.patient_name || 'Patient'}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="receipt-modal-wrapper">
      {/* On-Screen Action Bar */}
      <div className="no-print receipt-preview-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>Prescription &amp; Medical Order Preview</span>
          <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>A4 Letterhead Print Ready</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
            Print Prescription
          </button>
          {onClose && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Preview
            </button>
          )}
        </div>
      </div>

      {/* Printable Prescription Document */}
      <div ref={docRef} className="print-document medical-rx-doc">
        {/* Clinic & Doctor Letterhead */}
        <div className="rx-doc-header">
          <div className="rx-clinic-info">
            <h1 className="rx-clinic-name">{clinicName}</h1>
            <p className="rx-clinic-tagline">Department of {data.specialization || 'General Medicine'}</p>
            <p className="rx-clinic-contact">
              {data.contact?.address || 'Plot No. 42, Metro Health Park, Central Avenue, City Centre'} | Tel: {data.contact?.phone || '+91 98765 43210'}
            </p>
          </div>
          <div className="rx-doctor-info">
            <h2 className="rx-doc-name">{doctorDisplayName}</h2>
            <p className="rx-doc-spec">{data.specialization || 'Consulting Specialist'}</p>
            <p className="rx-doc-reg">Reg. No: MMC-{Math.floor(100000 + (data.doctor_name?.charCodeAt(0) || 0) * 342)}</p>
          </div>
        </div>

        <div className="rx-header-divider" />

        {/* Patient Details Strip */}
        <div className="rx-patient-bar">
          <div className="rx-p-field">
            <span className="p-label">Patient Name:</span>
            <span className="p-val"><strong>{data.patient_name}</strong></span>
          </div>
          <div className="rx-p-field">
            <span className="p-label">Age / Gender:</span>
            <span className="p-val">{data.date_of_birth ? `${data.date_of_birth}` : '—'} / {data.gender || '—'}</span>
          </div>
          <div className="rx-p-field">
            <span className="p-label">Date:</span>
            <span className="p-val">{formattedDate}</span>
          </div>
          <div className="rx-p-field">
            <span className="p-label">Rx ID:</span>
            <span className="p-val"><code>RX-{data.id?.slice(0, 8).toUpperCase()}</code></span>
          </div>
        </div>

        {/* Clinical Evaluation */}
        {(data.chief_complaint || data.diagnosis) && (
          <div className="rx-clinical-box">
            {data.chief_complaint && (
              <div className="rx-clin-row">
                <span className="clin-label">Chief Complaints:</span>
                <span className="clin-val">{data.chief_complaint}</span>
              </div>
            )}
            {data.diagnosis && (
              <div className="rx-clin-row">
                <span className="clin-label">Clinical Diagnosis:</span>
                <span className="clin-val"><strong>{data.diagnosis}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Prescription Rx Symbol */}
        <div className="rx-symbol-bar">
          <span className="rx-symbol">℞</span>
          <span className="rx-symbol-label">Prescribed Medications</span>
        </div>

        {/* Medicines Table */}
        <table className="rx-medicines-table">
          <thead>
            <tr>
              <th style={{ width: '30px', textAlign: 'center' }}>#</th>
              <th>Medicine Name &amp; Strength</th>
              <th style={{ width: '100px' }}>Dosage</th>
              <th style={{ width: '150px' }}>Schedule (M - A - E - N)</th>
              <th style={{ width: '90px' }}>Duration</th>
              <th>Food / Specific Instructions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => {
              const timing = {
                morning: item.timing_morning,
                afternoon: item.timing_afternoon,
                evening: item.timing_evening,
                night: item.timing_night,
              };
              const dose = item.dose || item.dosage || '1 Tablet';
              const frequency = item.frequency || formatFrequency(item.times_per_day, timing) || '1 time a day';

              const morningDose = item.timing_morning ? '1' : '0';
              const noonDose = item.timing_afternoon ? '1' : '0';
              const eveningDose = item.timing_evening ? '1' : '0';
              const nightDose = item.timing_night ? '1' : '0';
              const doseMatrix = `${morningDose} - ${noonDose} - ${eveningDose} - ${nightDose}`;

              return (
                <tr key={item.id || i}>
                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{item.medicine_name}</div>
                  </td>
                  <td>{dose}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{doseMatrix}</div>
                    <div className="table-subtext">{frequency}</div>
                  </td>
                  <td><strong>{item.duration || '—'}</strong></td>
                  <td>{item.instructions || 'After meals with water'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Ordered Investigations / Tests */}
        {Array.isArray(data.services) && data.services.length > 0 && (
          <div className="rx-investigations-box">
            <div className="inv-title">Advised Diagnostic Tests &amp; Clinical Investigations:</div>
            <ul className="inv-list">
              {data.services.map((s, idx) => (
                <li key={idx}>
                  <strong>{s.service_name || s.serviceName}</strong>
                  {s.notes && <span style={{ color: '#475569' }}> — {s.notes}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* General Advice */}
        {data.advice && (
          <div className="rx-advice-box">
            <div className="advice-title">Dietary &amp; General Advice:</div>
            <p className="advice-text">{data.advice}</p>
          </div>
        )}

        {/* Signature & Stamp Area */}
        <div className="rx-signature-container">
          <div className="rx-footer-note">
            <p>1. Please do not substitute prescribed medications without physician consultation.</p>
            <p>2. In case of emergency, please visit the nearest hospital emergency department.</p>
          </div>
          <div className="rx-doctor-sign">
            <div className="sign-spacer" />
            <div className="sign-line">{doctorDisplayName}</div>
            <div className="sign-qual">{data.specialization || 'Consulting Specialist'}</div>
          </div>
        </div>

        <div className="rx-bottom-tagline">
          {clinicName} • Electronic Health Record (EHR) &amp; Medical Prescription System
        </div>
      </div>
    </div>
  );
}
