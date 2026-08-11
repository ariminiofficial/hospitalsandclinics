import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/auth/AuthContext.jsx';
import { CLINIC } from '../public-site/clinicData.js';

const NAV = {
  receptionist: [
    { to: '/portal/receptionist', label: 'Dashboard', end: true },
    { to: '/portal/receptionist/appointments', label: 'Appointments' },
    { to: '/portal/receptionist/patients', label: 'Patients' },
    { to: '/portal/receptionist/walk-in', label: 'Walk-in' },
  ],
  doctor: [
    { to: '/portal/doctor', label: 'Dashboard', end: true },
    { to: '/portal/doctor/appointments', label: 'Appointments' },
    { to: '/portal/doctor/patients', label: 'Patients' },
    { to: '/portal/doctor/history', label: 'History' },
  ],
  pharmacist: [
    { to: '/portal/pharmacy', label: 'Queue', end: true },
    { to: '/portal/pharmacy/history', label: 'History' },
  ],
  admin: [
    { to: '/portal/admin', label: 'Dashboard', end: true },
    { to: '/portal/admin/doctors', label: 'Doctors' },
    { to: '/portal/admin/receptionists', label: 'Receptionists' },
    { to: '/portal/admin/appointments', label: 'Appointments' },
    { to: '/portal/admin/settings', label: 'Settings' },
    { to: '/portal/admin/permissions', label: 'Permissions' },
  ],
};

export default function PortalLayout({ allowedRoles }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('menu-open', mobileNav);
    return () => document.body.classList.remove('menu-open');
  }, [mobileNav]);

  useEffect(() => {
    setMobileNav(false);
  }, [location.pathname]);

  if (loading) return <div className="portal-loading">Loading...</div>;
  if (!user) return <Navigate to="/portal/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/portal/login" replace />;
  }

  const navItems = NAV[user.role] || [];
  const isActive = (item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const NavLinks = ({ onClick }) => (
    <>
      {navItems.map((item) => (
        <Link key={item.to} to={item.to} className={isActive(item) ? 'active' : ''} onClick={onClick}>{item.label}</Link>
      ))}
      {user.role === 'admin' && (
        <>
          <Link to="/portal/receptionist" onClick={onClick}>Receptionist View</Link>
          <Link to="/portal/doctor" onClick={onClick}>Doctor View</Link>
          <Link to="/portal/pharmacy" onClick={onClick}>Pharmacy View</Link>
        </>
      )}
    </>
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div>
          <div className="portal-brand">{CLINIC.name}</div>
          <div className="portal-user">
            <span>{user.email}</span>
            <span className="badge">{user.role}</span>
          </div>
        </div>
        <nav className="portal-nav">
          <NavLinks />
        </nav>
        <div className="portal-sidebar-footer">
          <button type="button" className="portal-logout" onClick={logout}>
            <svg className="portal-logout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      <div className="portal-content">
        <header className="portal-mobile-header">
          <button type="button" className={`menu-toggle ${mobileNav ? 'open' : ''}`} aria-label="Menu" aria-expanded={mobileNav} onClick={() => setMobileNav((o) => !o)}>
            <span /><span /><span />
          </button>
          <span className="portal-mobile-title">{CLINIC.name}</span>
          <Link to="/" className="portal-home-link">Website</Link>
        </header>
        {mobileNav && (
          <>
            <button type="button" className="nav-backdrop portal-nav-backdrop" aria-label="Close menu" onClick={() => setMobileNav(false)} />
            <nav className="portal-mobile-nav">
              <NavLinks onClick={() => setMobileNav(false)} />
              <div className="portal-sidebar-footer">
                <button
                  type="button"
                  className="portal-logout"
                  onClick={(e) => { e.stopPropagation(); logout(); setMobileNav(false); }}
                >
                  <svg className="portal-logout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            </nav>
          </>
        )}
        <main className="portal-main"><Outlet /></main>
      </div>
    </div>
  );
}
