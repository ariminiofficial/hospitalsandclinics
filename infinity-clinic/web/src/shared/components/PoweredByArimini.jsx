export default function PoweredByArimini({ className = '', style = {} }) {
  return (
    <footer className={`arimini-sticky-footer ${className}`} style={style}>
      <div className="arimini-footer-inner">
        <span className="arimini-footer-label">Powered by</span>
        <a
          href="https://www.arimini.in"
          target="_blank"
          rel="noopener noreferrer"
          className="arimini-brand-link"
          title="Engineered by Arimini — Clinic Management & Healthcare Intelligence"
        >
          <img
            src="/arimini.png"
            alt="Arimini"
            className="arimini-logo-img"
            onError={(e) => {
              e.currentTarget.src = '/logo.svg';
            }}
          />
          <svg className="arimini-ext-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
