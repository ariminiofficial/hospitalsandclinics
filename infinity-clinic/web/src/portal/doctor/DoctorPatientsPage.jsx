import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (query.length >= 2) {
      api.get(`/portal/patients/search?q=${encodeURIComponent(query)}`).then(setPatients).catch(console.error);
    } else {
      setPatients([]);
    }
  }, [query]);

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.doctorPatients.title}
        subtitle={PAGE_HELP.doctorPatients.subtitle}
        description={PAGE_HELP.doctorPatients.description}
      />

      <PortalToolbar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name or phone (min 2 chars)..."
        resultCount={query.length >= 2 ? patients.length : undefined}
      />

      <div className="patient-search-results">
        {patients.map((p) => (
          <div key={p.id} className="list-item patient-search-card list-item-with-actions">
            <div className="list-item-main">
              <strong>{p.full_name}</strong>
              <p className="text-body-sm">{p.phone}</p>
            </div>
            <Link to={`/portal/doctor/patients/${p.id}`} className="btn btn-sm btn-primary">View Profile</Link>
          </div>
        ))}
        {query.length >= 2 && patients.length === 0 && (
          <p className="text-body-sm">No patients found.</p>
        )}
        {query.length < 2 && (
          <div className="card card-muted">
            <p className="text-body-sm">Type at least 2 characters to search patients.</p>
          </div>
        )}
      </div>
    </div>
  );
}
