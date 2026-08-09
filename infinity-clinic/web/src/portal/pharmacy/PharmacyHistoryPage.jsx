import { useEffect, useMemo, useState } from 'react';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import PrescriptionViewModal from '../shared/PrescriptionViewModal.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';
import { matchesSearch } from '../shared/portalSearch.js';

export default function PharmacyHistoryPage() {
  const [history, setHistory] = useState([]);
  const [days, setDays] = useState(7);
  const [search, setSearch] = useState('');
  const [viewRx, setViewRx] = useState(null);

  useEffect(() => {
    api.get(`/portal/pharmacy/history?days=${days}`).then(setHistory).catch(console.error);
  }, [days]);

  const filtered = useMemo(() => history.filter((rx) => {
    const items = Array.isArray(rx.items) ? rx.items : [];
    return matchesSearch(
      search,
      rx.patient_name,
      rx.patient_phone,
      rx.doctor_name,
      rx.token_number,
      items.map((i) => i.medicine_name).join(' '),
    );
  }), [history, search]);

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.pharmacyHistory.title}
        subtitle={PAGE_HELP.pharmacyHistory.subtitle}
        description={PAGE_HELP.pharmacyHistory.description}
      >
        <select className="portal-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={1}>Today</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </PortalHeader>

      <PortalToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patient, doctor, medicine..."
        resultCount={filtered.length}
        totalCount={history.length}
      />

      <div className="table-wrap table-wrap--cards">
        <p className="table-mobile-hint">Swipe horizontally on small screens</p>
        <table className="table">
          <thead>
            <tr><th>Dispensed</th><th>Patient</th><th>Doctor</th><th>Medicines</th><th>Token</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((rx) => {
              const items = Array.isArray(rx.items) ? rx.items : [];
              return (
                <tr key={rx.id}>
                  <td data-label="Dispensed">{rx.dispensed_at ? new Date(rx.dispensed_at).toLocaleString('en-IN') : '—'}</td>
                  <td data-label="Patient">{rx.patient_name}<br /><span className="text-body-sm">{rx.patient_phone}</span></td>
                  <td data-label="Doctor">{rx.doctor_name}</td>
                  <td data-label="Medicines" className="text-body-sm">{items.map((i) => i.medicine_name).join(', ') || '—'}</td>
                  <td data-label="Token">#{rx.token_number || '—'}</td>
                  <td data-label="Actions" className="actions-cell">
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewRx(rx)}>View</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} data-label="">{history.length ? 'No matches for your search.' : 'No dispensed prescriptions in this period.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <PrescriptionViewModal prescription={viewRx} onClose={() => setViewRx(null)} />
    </div>
  );
}
