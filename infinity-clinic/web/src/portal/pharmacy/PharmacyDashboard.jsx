import { useState, useMemo } from 'react';
import { api } from '../../shared/api/client.js';
import { formatFrequency } from '../../shared/schema/prescription.js';
import { usePharmacySocket } from '../../shared/realtime/usePharmacySocket.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import SectionIntro from '../shared/SectionIntro.jsx';
import { PAGE_HELP, METRIC_HELP, SECTION_HELP } from '../shared/portalHelp.js';
import { matchesSearch, PHARMACY_STATUS_OPTIONS } from '../shared/portalSearch.js';

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

function PrescriptionDetail({ rx, onDispense, onClose }) {
  const items = Array.isArray(rx.items) ? rx.items : [];

  return (
    <div className="pharmacy-detail card">
      <div className="page-header page-header-compact">
        <div>
          <h3>{rx.patient_name}</h3>
          <p className="text-body-sm">{rx.patient_phone} · Dr. {rx.doctor_name}</p>
        </div>
        <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>Close</button>
      </div>

      <div className="pharmacy-meta">
        {rx.token_number && <span className="badge">Token #{rx.token_number}</span>}
        <StatusBadge status={rx.pharmacy_status === 'pending' ? 'waiting' : 'in_consultation'} />
        <span className="text-body-sm">{new Date(rx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <ul className="rx-summary-list" style={{ marginTop: 16 }}>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.medicine_name}</strong>
            <span>{formatRxLine(item)}</span>
            {item.instructions && <em>{item.instructions}</em>}
          </li>
        ))}
      </ul>

      {rx.advice && <p className="text-body-sm" style={{ marginTop: 12 }}><strong>Advice:</strong> {rx.advice}</p>}

      {rx.pharmacy_status !== 'dispensed' && (
        <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={() => onDispense(rx.id)}>
          Mark as Dispensed
        </button>
      )}
    </div>
  );
}

export default function PharmacyDashboard() {
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  usePharmacySocket(setQueue);

  const handleSelect = async (rx) => {
    setSelected(rx);
    if (rx.pharmacy_status === 'pending') {
      try {
        const updated = await api.post(`/portal/pharmacy/${rx.id}/start`);
        setSelected(updated);
        setQueue((q) => q.map((r) => (r.id === updated.id ? updated : r)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDispense = async (id) => {
    setDispensing(true);
    try {
      await api.post(`/portal/pharmacy/${id}/dispense`);
      setSelected(null);
      const data = await api.get('/portal/pharmacy/queue');
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDispensing(false);
    }
  };

  const pending = queue.filter((r) => r.pharmacy_status === 'pending').length;
  const active = queue.filter((r) => r.pharmacy_status === 'dispensing').length;

  const filtered = useMemo(() => queue.filter((rx) => {
    const statusOk = statusFilter === 'all' || rx.pharmacy_status === statusFilter;
    const items = Array.isArray(rx.items) ? rx.items : [];
    const medNames = items.map((i) => i.medicine_name).join(' ');
    const searchOk = matchesSearch(search, rx.patient_name, rx.patient_phone, rx.doctor_name, rx.token_number, medNames);
    return statusOk && searchOk;
  }), [queue, search, statusFilter]);

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.pharmacyDashboard.title}
        subtitle={PAGE_HELP.pharmacyDashboard.subtitle}
        description={PAGE_HELP.pharmacyDashboard.description}
      >
        <StatusBadge status="confirmed" />
      </PortalHeader>

      <div className="metrics-grid">
        <MetricCard value={pending} label={METRIC_HELP.pharmacyWaiting.label} description={METRIC_HELP.pharmacyWaiting.description} />
        <MetricCard value={active} label={METRIC_HELP.pharmacyInProgress.label} description={METRIC_HELP.pharmacyInProgress.description} />
        <MetricCard value={queue.length} label={METRIC_HELP.pharmacyTotal.label} description={METRIC_HELP.pharmacyTotal.description} />
      </div>

      <div className="portal-two-panel">
        <section className="portal-panel">
          <SectionIntro title={SECTION_HELP.livePrescriptionQueue.title} description={SECTION_HELP.livePrescriptionQueue.description} />
          <PortalToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search patient, doctor, medicine..."
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={PHARMACY_STATUS_OPTIONS}
            resultCount={filtered.length}
            totalCount={queue.length}
          />
          <div className="pharmacy-queue">
            {filtered.map((rx) => (
              <div key={rx.id} className={`pharmacy-queue-item list-item list-item-with-actions ${selected?.id === rx.id ? 'active' : ''}`}>
                <button type="button" className="list-item-main pharmacy-queue-main" onClick={() => handleSelect(rx)}>
                  <div className="token-badge">#{rx.token_number || '—'}</div>
                  <div className="queue-item-body">
                    <strong>{rx.patient_name}</strong>
                    <p className="text-body-sm">Dr. {rx.doctor_name} · {(Array.isArray(rx.items) ? rx.items : []).length} medicine(s)</p>
                  </div>
                  <StatusBadge status={rx.pharmacy_status === 'pending' ? 'waiting' : 'in_consultation'} />
                </button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => handleSelect(rx)}>View</button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">℞</div>
                <p>{queue.length ? 'No matches for your search.' : 'No prescriptions waiting. They appear when a doctor completes a visit.'}</p>
              </div>
            )}
          </div>
        </section>

        <section className="portal-panel portal-panel-side">
          {selected ? (
            <PrescriptionDetail
              rx={selected}
              onDispense={handleDispense}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="card card-muted" style={{ minHeight: 200 }}>
              <p className="text-body-sm">Select a prescription from the queue to view medicines and dispense.</p>
            </div>
          )}
          {dispensing && <p className="text-body-sm">Saving...</p>}
        </section>
      </div>
    </div>
  );
}
