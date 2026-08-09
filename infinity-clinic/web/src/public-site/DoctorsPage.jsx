import { Link } from 'react-router-dom';
import { useWebsite } from './WebsiteContext.jsx';
import PageHero from './components/PageHero.jsx';
import Plaque from './components/Plaque.jsx';
import CtaBand from './components/CtaBand.jsx';

export default function DoctorsPage() {
  const { clinic, departments, pages } = useWebsite();
  const page = pages.doctors;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lede={page.lede}
      >
        <div className="hero-cta reveal" style={{ marginTop: 24 }}>
          <Link to="/book" className="btn btn-primary">Book an appointment</Link>
          <a className="btn btn-ghost" href={`tel:+91${clinic.phone}`}>Call {clinic.phoneDisplay}</a>
        </div>
      </PageHero>

      <div className="dept-nav wrap reveal">
        {departments.map((d) => (
          <a key={d.id} href={`#${d.slug}`} className={`dept-nav-item dep-${d.color}-soft`}>{d.signpost.label}</a>
        ))}
      </div>

      <div className="wall">
        {departments.map((d) => (
          <Plaque key={d.num} dept={d} showBook />
        ))}
      </div>

      <section className="section-light">
        <div className="wrap">
          <div className="info-callout reveal">
            <h3>{page.calloutTitle}</h3>
            <p>{page.calloutBody} Call <a href={`tel:+91${clinic.phone}`}>{clinic.phoneDisplay}</a> — or <Link to="/services">browse services by department</Link> or read <Link to="/about">how your first visit works</Link>.</p>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
