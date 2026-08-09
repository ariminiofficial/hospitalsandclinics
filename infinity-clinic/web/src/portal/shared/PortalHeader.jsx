export default function PortalHeader({ title, subtitle, description, children }) {
  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {children && <div className="page-header-actions">{children}</div>}
      </div>
      {description && (
        <div className="portal-help-box" role="note">
          <p>{description}</p>
        </div>
      )}
    </>
  );
}
