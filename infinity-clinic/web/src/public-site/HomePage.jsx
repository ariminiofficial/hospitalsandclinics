import { Link } from 'react-router-dom';
import { useWebsite } from './WebsiteContext.jsx';
import CtaBand from './components/CtaBand.jsx';
import LocationBlock from './components/LocationBlock.jsx';

export default function HomePage() {
  const { clinic, hero, home, departments, whyCards, testimonials, services } = useWebsite();
  const previewStories = testimonials.slice(0, 3);
  const titleParts = hero.title.split('. ').filter(Boolean);
  const servicePreview = services
    ? services.map((s) => s.title)
    : ['Angiography & Angioplasty', 'ECG · 2D-ECHO · TMT', 'Endoscopic Sinus Surgery', 'Arthroscopy & Joint Replacement', 'Epilepsy & Migraine Care', 'High-Risk Pregnancy'];

  return (
    <>
      <section className="hero" id="top">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow reveal">{hero.subtitle}</div>
            <h1 className="reveal">
              {titleParts.length > 1 ? (
                <>{titleParts[0]}.<br /><em>{titleParts.slice(1).join('. ')}</em></>
              ) : (
                hero.title
              )}
            </h1>
            <p className="hero-lede reveal">{hero.lede}</p>
            <div className="hero-cta reveal">
              <a className="btn btn-primary" href={`tel:+91${clinic.phone}`}>Call {clinic.phoneDisplay}</a>
              <Link className="btn btn-ghost" to={hero.ctaLink}>{hero.ctaText} →</Link>
            </div>
            <div className="hero-meta reveal">
              <div><span className="n">5</span><span className="l">Specialities on site</span></div>
              <div><span className="n">18+</span><span className="l">Yrs, senior cardiologist</span></div>
              <div><span className="n">440027</span><span className="l">Omkar Nagar pin code</span></div>
            </div>
          </div>

          <div className="signpost reveal">
            <div className="signpost-top">
              इन्फिनिटी क्लिनीक्स
              <small>{clinic.name} — Directory</small>
            </div>
            <div className="signpost-rows">
              {departments.map((d) => (
                <Link key={d.num} to={`/doctors#${d.slug}`} className="sp-row sp-row-link">
                  <span className={`tag dep-${d.color}`} />
                  <span className="dep">{d.signpost.label}</span>
                  <span className="doc">{d.signpost.doctor}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-light">
        <div className="wrap">
          <div className="sec-head sec-head-row reveal">
            <div>
              <div className="eyebrow">{home.specialistsEyebrow}</div>
              <h2>{home.specialistsTitle}</h2>
              <p>{home.specialistsDesc.replace('Infinity Clinics', clinic.name)}</p>
            </div>
            <Link to="/doctors" className="btn btn-ghost">Meet all specialists →</Link>
          </div>
          <div className="preview-grid">
            {departments.slice(0, 3).map((d) => (
              <Link key={d.id} to={`/doctors#${d.slug}`} className="preview-card reveal">
                <span className={`preview-tag dep-${d.color}`} />
                <h3>{d.signpost.label}</h3>
                <p className="preview-name">{d.name}</p>
                <p className="preview-cred">{d.cred}</p>
              </Link>
            ))}
          </div>
          <p className="preview-more reveal">
            Also at this address: <Link to="/doctors#orthopaedics">Bone & Joint (Dr. Kolhe)</Link> · <Link to="/doctors#neurology">Neurology (Dr. Khandait)</Link>
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head sec-head-row reveal">
            <div>
              <div className="eyebrow">{home.servicesEyebrow}</div>
              <h2>{home.servicesTitle}</h2>
              <p>{home.servicesDesc}</p>
            </div>
            <Link to="/services" className="btn btn-ghost">All services →</Link>
          </div>
          <div className="service-preview-grid reveal">
            {servicePreview.map((s) => (
              <div key={s} className="service-preview-item">{s}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-light" id="why">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">{home.whyEyebrow}</div>
            <h2>{home.whyTitle}</h2>
            <p>{home.whyDesc}</p>
          </div>
          <div className="why-grid reveal">
            {whyCards.map((c) => (
              <div key={c.num} className="why-card">
                <div className="why-num">{c.num}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link to="/about" className="btn btn-ghost">Read our story →</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head sec-head-row reveal">
            <div>
              <div className="eyebrow">{home.storiesEyebrow}</div>
              <h2>{home.storiesTitle}</h2>
            </div>
            <Link to="/testimonials" className="btn btn-ghost">All stories →</Link>
          </div>
          <div className="why-grid reveal">
            {previewStories.map((t) => (
              <div key={t.id || t.patient_name} className="why-card testimonial-preview">
                <div className="why-num">{'★'.repeat(t.rating || 5)}{t.department ? ` · ${t.department}` : ''}</div>
                <p>&ldquo;{t.content}&rdquo;</p>
                <p className="text-body-sm">— {t.patient_name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="loc-band" id="location">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">{home.locationEyebrow}</div>
            <h2>{home.locationTitle}</h2>
            <p>{home.locationDesc}</p>
          </div>
          <LocationBlock />
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link to="/contact" className="btn btn-ghost" style={{ borderColor: '#fff', color: '#fff' }}>Full contact & directions →</Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
