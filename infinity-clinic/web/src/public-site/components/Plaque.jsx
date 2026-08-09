import { Link } from 'react-router-dom';

export default function Plaque({ dept, showBook = false, compact = false }) {
  return (
    <div className={`plaque reveal ${compact ? 'plaque-compact' : ''}`} id={dept.slug}>
      <div className={`plaque-strip dep-${dept.color}`} />
      <div className="plaque-num">{dept.num}</div>
      <div className="plaque-doc">
        <span className={`plaque-dept dep-${dept.color}-soft`}>{dept.dept}</span>
        <div className="plaque-name">{dept.name}</div>
        <div className="plaque-cred">{dept.cred}</div>
        <div className={`plaque-role dep-${dept.color}-text`}>{dept.role}</div>
        {!compact && dept.bio && <p className="plaque-bio">{dept.bio}</p>}
      </div>
      <div className="plaque-info">
        {!compact && dept.whenToVisit && (
          <div className="when-to-visit">
            <span className="text-label">When to visit</span>
            <ul>
              {dept.whenToVisit.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
        <div className="plaque-services">
          {dept.services.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
        <div className="plaque-meta">
          <span className="plaque-note">{dept.note}</span>
          {dept.timing && <span className="plaque-timing">{dept.timing}</span>}
          {dept.fee && <span className="plaque-fee">{dept.fee}</span>}
        </div>
        {showBook && (
          <Link to="/book" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Book with {dept.shortName}</Link>
        )}
      </div>
    </div>
  );
}
