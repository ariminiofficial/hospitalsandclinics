import { Link } from 'react-router-dom';
import { useWebsite } from './WebsiteContext.jsx';
import PageHero from './components/PageHero.jsx';
import CtaBand from './components/CtaBand.jsx';

export default function ServicesPage() {
  const { departments, diagnostics, services, pages } = useWebsite();
  const page = pages.services;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lede={page.lede}
      />

      {services && (
        <section>
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="eyebrow">Clinic Services</div>
              <h2>Five departments under one roof.</h2>
            </div>
            <div className="service-detail-grid reveal">
              {services.map((s) => (
                <div key={s.id} className="service-detail-card">
                  <span className={`preview-tag dep-${s.icon || 'heart'}`} style={{ marginBottom: 12 }} />
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-light">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">{page.diagnosticsEyebrow}</div>
            <h2>{page.diagnosticsTitle}</h2>
            <p>{page.diagnosticsDesc}</p>
          </div>
          <div className="diag-grid reveal">
            {diagnostics.map((d) => (
              <div key={d.name} className="diag-card">
                <span className="diag-dept">{d.dept}</span>
                <h3>{d.name}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {departments.map((dept, i) => (
        <section key={dept.id} className={i % 2 === 1 ? 'section-light' : ''} id={dept.slug}>
          <div className="wrap">
            <div className="service-dept-header reveal">
              <span className={`plaque-dept dep-${dept.color}-soft`}>{dept.dept}</span>
              <h2>{dept.name}</h2>
              <p className="service-dept-role">{dept.role}</p>
              <p className="service-dept-bio">{dept.bio}</p>
            </div>
            <div className="service-detail-grid reveal">
              {dept.serviceDetails.map((s) => (
                <div key={s.name} className="service-detail-card">
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="service-dept-footer reveal">
              <div className="plaque-services">
                {dept.services.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
              <div className="service-dept-actions">
                <span className="plaque-timing">{dept.timing}</span>
                <span className="plaque-fee">{dept.fee}</span>
                <Link to="/book" className="btn btn-primary btn-sm">Book {dept.shortName}</Link>
                <Link to={`/doctors#${dept.slug}`} className="btn btn-ghost btn-sm">View profile</Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section-light">
        <div className="wrap">
          <div className="info-callout reveal">
            <h3>{page.feeNoteTitle}</h3>
            <p>{page.feeNoteBody}</p>
          </div>
        </div>
      </section>

      <CtaBand title={page.ctaTitle} subtitle={page.ctaSubtitle} />
    </>
  );
}
