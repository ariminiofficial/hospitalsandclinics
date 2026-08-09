import { useEffect, useState } from 'react';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import { PAGE_HELP } from '../shared/portalHelp.js';

export default function PermissionsPage() {
  const [data, setData] = useState(null);
  const [matrix, setMatrix] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => api.get('/portal/admin/permissions').then((d) => {
    setData(d);
    setMatrix(d.matrix);
  });

  useEffect(() => { load().catch(console.error); }, []);

  const toggle = (role, key) => {
    setMatrix((prev) => {
      const current = new Set(prev[role] || []);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, [role]: [...current] };
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const result = await api.put('/portal/admin/permissions', { matrix });
      setData(result);
      setMatrix(result.matrix);
      setMessage('Permissions saved. Staff may need to log out and back in to see changes.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Reset receptionist and doctor permissions to defaults?')) return;
    setSaving(true);
    try {
      const result = await api.post('/portal/admin/permissions/reset');
      setData(result);
      setMatrix(result.matrix);
      setMessage('Permissions reset to defaults.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="portal-page">Loading permissions…</div>;

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.adminPermissions.title}
        subtitle={PAGE_HELP.adminPermissions.subtitle}
        description={PAGE_HELP.adminPermissions.description}
      >
        <div className="page-header-actions">
          <button type="button" className="btn btn-secondary" onClick={reset} disabled={saving}>Reset defaults</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save permissions'}
          </button>
        </div>
      </PortalHeader>

      {message && <div className="alert-success">{message}</div>}

      <div className="info-callout" style={{ marginBottom: 24 }}>
        <h3>Admin always has full access</h3>
        <p>Only <strong>receptionist</strong> and <strong>doctor</strong> roles can be customized below. Changes apply immediately on the API — staff should re-login to refresh their session.</p>
      </div>

      {data.catalog.map((group) => (
        <section key={group.group} className="perm-group card">
          <h3 className="section-title">{group.group}</h3>
          <div className="perm-matrix">
            <div className="perm-matrix-inner">
            <div className="perm-matrix-header">
              <span className="perm-label-col">Permission</span>
              {data.roles.map((role) => (
                <span key={role} className="perm-role-col">{role}</span>
              ))}
            </div>
            {group.permissions.map((perm) => (
              <div key={perm.key} className="perm-matrix-row">
                <div className="perm-label-col">
                  <strong>{perm.label}</strong>
                  <span className="text-body-sm">{perm.description}</span>
                </div>
                {data.roles.map((role) => (
                  <label key={role} className="perm-role-col perm-toggle">
                    <input
                      type="checkbox"
                      checked={(matrix[role] || []).includes(perm.key)}
                      onChange={() => toggle(role, perm.key)}
                    />
                  </label>
                ))}
              </div>
            ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
