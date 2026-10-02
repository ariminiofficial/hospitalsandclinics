import { useEffect, useState } from 'react';
import { api } from '../../shared/api/client.js';

import { formatFrequency } from '../../shared/schema/prescription.js';

export default function PrescriptionPrint({ prescriptionId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/portal/prescriptions/${prescriptionId}/print`).then(setData).catch(console.error);
  }, [prescriptionId]);

  if (!data) return <p>Loading...</p>;

  const clinicName = typeof data.clinic_name === 'string' ? data.clinic_name.replace(/"/g, '') : 'Pulse Multi-Specialty Clinic';

  return (
    <div className="print-area prescription-print">
      <div className="rx-header">
        <h2>{clinicName}</h2>
        <p>{data.contact?.address} | {data.contact?.phone}</p>
      </div>
      <hr />
      <div className="rx-meta">
        <div>
          <p><strong>Patient:</strong> {data.patient_name}</p>
          <p><strong>Age/Gender:</strong> {data.date_of_birth || '—'} / {data.gender || '—'}</p>
        </div>
        <div>
          <p><strong>Dr.</strong> {data.doctor_name}</p>
          <p>{data.specialization}</p>
          <p>{new Date(data.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      {data.chief_complaint && <p><strong>Complaint:</strong> {data.chief_complaint}</p>}
      {data.diagnosis && <p><strong>Diagnosis:</strong> {data.diagnosis}</p>}
      <hr />
      <h3>℞</h3>
      <table className="rx-table">
        <thead><tr><th>#</th><th>Medicine</th><th>Dose</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
        <tbody>
          {data.items.map((item, i) => {
            const timing = {
              morning: item.timing_morning,
              afternoon: item.timing_afternoon,
              evening: item.timing_evening,
              night: item.timing_night,
            };
            const dose = item.dose || item.dosage || '—';
            const frequency = item.frequency || formatFrequency(item.times_per_day, timing) || '—';
            return (
              <tr key={item.id}>
                <td>{i + 1}</td>
                <td><strong>{item.medicine_name}</strong></td>
                <td>{dose}</td>
                <td>{frequency}</td>
                <td>{item.duration || '—'}</td>
                <td>{item.instructions || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {Array.isArray(data.services) && data.services.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Ordered Investigations &amp; Procedures</h4>
          <ul style={{ margin: '6px 0 12px 18px' }}>
            {data.services.map((s, idx) => (
              <li key={idx}>
                <strong>{s.service_name || s.serviceName}</strong>
                {s.notes && ` — ${s.notes}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.advice && <p style={{ marginTop: '1rem' }}><strong>Advice:</strong> {data.advice}</p>}
      <div className="no-print" style={{ marginTop: '2rem' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
