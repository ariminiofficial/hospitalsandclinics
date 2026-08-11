import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/client.js';
import PortalHeader from '../shared/PortalHeader.jsx';
import MetricCard from '../shared/MetricCard.jsx';
import SectionIntro from '../shared/SectionIntro.jsx';
import { PAGE_HELP, METRIC_HELP, SECTION_HELP, STATUS_HELP } from '../shared/portalHelp.js';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get('/portal/admin/metrics/dashboard').then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) return <div className="portal-page">Loading dashboard…</div>;

  const statusEntries = Object.entries(metrics.appointmentsByStatus || {});

  return (
    <div className="portal-page">
      <PortalHeader
        title={PAGE_HELP.adminDashboard.title}
        subtitle={`Overview — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        description={PAGE_HELP.adminDashboard.description}
      />

      <div className="metrics-grid">
        <MetricCard value={metrics.totalPatients} label={METRIC_HELP.totalPatients.label} description={METRIC_HELP.totalPatients.description} />
        <MetricCard value={metrics.activeDoctors} label={METRIC_HELP.activeDoctors.label} description={METRIC_HELP.activeDoctors.description} />
        <MetricCard value={metrics.todayAppointments} label={METRIC_HELP.todayAppointments.label} description={METRIC_HELP.todayAppointments.description} />
        <MetricCard value={metrics.todayCompleted} label={METRIC_HELP.todayCompletedAdmin.label} description={METRIC_HELP.todayCompletedAdmin.description} />
        <MetricCard value={`₹${Number(metrics.revenueLast30Days || 0).toLocaleString('en-IN')}`} label={METRIC_HELP.revenue30.label} description={METRIC_HELP.revenue30.description} />
      </div>

      <SectionIntro title={SECTION_HELP.appointmentsByStatus.title} description={SECTION_HELP.appointmentsByStatus.description} />
      <div className="metrics-grid" style={{ marginBottom: 32 }}>
        {statusEntries.map(([status, count]) => (
          <MetricCard
            key={status}
            value={count}
            label={status.replace(/_/g, ' ')}
            description={STATUS_HELP[status] || 'Appointment count for this status.'}
          />
        ))}
        {statusEntries.length === 0 && <p className="text-body-sm">No appointments in the last 30 days.</p>}
      </div>

      <SectionIntro title={SECTION_HELP.quickLinks.title} description={SECTION_HELP.quickLinks.description} />
      <div className="quick-links">
        <Link to="/portal/admin/doctors" className="quick-link-card">Manage Doctors</Link>
        <Link to="/portal/admin/appointments" className="quick-link-card">View Appointments</Link>
        <Link to="/portal/admin/permissions" className="quick-link-card">Role Permissions</Link>
        <Link to="/portal/admin/settings" className="quick-link-card">Clinic Settings</Link>
        <Link to="/portal/receptionist" className="quick-link-card">Reception Desk</Link>
        <Link to="/portal/doctor" className="quick-link-card">Doctor Portal</Link>
      </div>
    </div>
  );
}
