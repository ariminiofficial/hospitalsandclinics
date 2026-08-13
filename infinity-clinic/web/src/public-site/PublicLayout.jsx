import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { WebsiteProvider, useWebsite } from './WebsiteContext.jsx';

function PublicLayoutInner() {
  const { clinic, footer } = useWebsite();
  const { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname, hash]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const syncHeight = () => {
      const bottom = Math.round(header.getBoundingClientRect().bottom);
      document.documentElement.style.setProperty('--header-bottom', `${Math.max(0, bottom)}px`);
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(header);
    window.addEventListener('scroll', syncHeight, { passive: true });
    window.addEventListener('resize', syncHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', syncHeight);
      window.removeEventListener('resize', syncHeight);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth > 1024) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      <Link to="/" onClick={closeMenu}>Home</Link>
      <Link to="/about" onClick={closeMenu}>About</Link>
      <Link to="/doctors" onClick={closeMenu}>Specialists</Link>
      <Link to="/services" onClick={closeMenu}>Services</Link>
      <Link to="/contact" onClick={closeMenu}>Visit Us</Link>
      <Link to="/testimonials" onClick={closeMenu}>Stories</Link>
      <Link to="/book" className="btn btn-primary" onClick={closeMenu}>Book Online</Link>
      <Link to="/portal/login" className="nav-staff" onClick={closeMenu}>Staff</Link>
    </>
  );

  return (
    <div className="site">
      <div className="ribbon">
        <div className="wrap">
          <span>{clinic.ribbon}</span>
          <a className="phone" href={`tel:+91${clinic.phone}`}>Call &nbsp;{clinic.phoneDisplay}</a>
        </div>
      </div>
      <header ref={headerRef}>
        <div className="nav wrap">
          <Link to="/" className="brand" onClick={closeMenu}>
            <div className="brand-mark">∞</div>
            <div>
              <div className="brand-name">{clinic.name}</div>
              <div className="brand-sub">{clinic.tagline}</div>
            </div>
          </Link>
          <nav className="links links-bar">{navLinks}</nav>
          <button
            type="button"
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
      {menuOpen && <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={closeMenu} />}
      <nav id="site-nav" className={`links links-drawer ${menuOpen ? 'open' : ''}`}>
        {navLinks}
      </nav>
      <main><Outlet /></main>
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <h4>{clinic.name}</h4>
              <p>{footer.tagline}</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <Link to="/about">About Us</Link>
              <Link to="/doctors">Our Specialists</Link>
              <Link to="/services">Services</Link>
              <Link to="/testimonials">Patient Stories</Link>
            </div>
            <div>
              <h4>Visit</h4>
              <a href={`tel:+91${clinic.phone}`}>{clinic.phoneDisplay}</a>
              <Link to="/contact">Manewada Ring Road, Omkar Nagar</Link>
              <Link to="/book">Book appointment online</Link>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} {clinic.name}, Nagpur</span>
            <span>{footer.disclaimer}</span>
          </div>
        </div>
      </footer>
      <a className="float-call" href={`tel:+91${clinic.phone}`} aria-label={`Call ${clinic.name}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>
    </div>
  );
}

export default function PublicLayout() {
  return (
    <WebsiteProvider>
      <PublicLayoutInner />
    </WebsiteProvider>
  );
}
