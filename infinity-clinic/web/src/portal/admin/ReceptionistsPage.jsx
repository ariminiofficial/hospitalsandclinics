import { useEffect, useMemo, useState } from 'react';
import { api } from '../../shared/api/client.js';
import { emptyReceptionistForm } from '../../shared/schema/index.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import PortalToolbar from '../shared/PortalToolbar.jsx';
import StatusBadge from '../shared/StatusBadge.jsx';
import Modal from '../../shared/components/Modal.jsx';
import DetailDl from '../shared/DetailDl.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';
import { matchesSearch } from '../shared/portalSearch.js';

export default function ReceptionistsPage() {
  const [receptionists, setReceptionists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyReceptionistForm());
  const [search, setSearch] = useState('');
  const [viewReceptionist, setViewReceptionist] = useState(null);

  const load = () => api.get('/portal/admin/receptionists').then(setReceptionists).catch(console.error);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => receptionists.filter((r) => matchesSearch(
    search, r.full_name, r.email,
  )), [receptionists, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/portal/admin/receptionists', form);
    setShowForm(false);
    setForm(emptyReceptionistForm());
    load();
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this receptionist?')) return;
    await api.patch(`/portal/admin/receptionists/${id}/deactivate`);
    load();
  };

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.adminReceptionists.title}
        subtitle={PAGE_HELP.adminReceptionists.subtitle}
        description={PAGE_HELP.adminReceptionists.description}
      >
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>Add Receptionist</button>
      </PortalHeader>

      <PortalToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name or email..."
        resultCount={filtered.length}
        totalCount={receptionists.length}
      />

      <div className="table-wrap table-wrap--cards">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td data-label="Name">{r.full_name}</td>
                <td data-label="Email">{r.email}</td>
                <td data-label="Status"><StatusBadge status={r.is_active ? 'confirmed' : 'cancelled'} /></td>
                <td data-label="Actions" className="actions-cell row-actions">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setViewReceptionist(r)}>View</button>
                  {r.is_active && <button type="button" className="btn btn-sm btn-danger" onClick={() => deactivate(r.id)}>Deactivate</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4}>{receptionists.length ? 'No matches for your search.' : 'No receptionists yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewReceptionist} onClose={() => setViewReceptionist(null)} title="Receptionist Details">
        {viewReceptionist && (
          <>
            <DetailDl
              items={[
                { label: 'Name', value: viewReceptionist.full_name },
                { label: 'Email', value: viewReceptionist.email },
                { label: 'Status', value: <StatusBadge status={viewReceptionist.is_active ? 'confirmed' : 'cancelled'} /> },
              ]}
            />
            <div className="modal-footer-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewReceptionist(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Receptionist">
        <form onSubmit={handleCreate} className="form">
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></label>
          <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      </Modal>
    </div>
  );
}
