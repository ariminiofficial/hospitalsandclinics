import { useWebsite } from './WebsiteContext.jsx';
import PageHero from './components/PageHero.jsx';
import LocationBlock from './components/LocationBlock.jsx';
import CtaBand from './components/CtaBand.jsx';

export default function ContactPage() {
  const { clinic, visitSteps, faq, pages } = useWebsite();
  const page = pages.contact;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lede={page.lede}
      >
        <div className="hero-cta reveal" style={{ marginTop: 24 }}>
          <a className="btn btn-primary" href={`tel:+91${clinic.phone}`}>Call {clinic.phoneDisplay}</a>
          <a className="btn btn-ghost" href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </PageHero>

      <section className="loc-band">
        <div className="wrap">
          <LocationBlock />
        </div>
      </section>

      <section className="section-light">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Department Timings</div>
            <h2>{page.timingsTitle}</h2>
          </div>
          <div className="timing-grid reveal">
            <div className="timing-card">
              <h3>Heart · ENT · Ortho · Gynae</h3>
              <p>Monday – Saturday</p>
              <p className="timing-detail">{clinic.generalTiming}</p>
              <p className="text-body-sm">Call ahead to confirm the specialist&apos;s timing for your visit day</p>
            </div>
            <div className="timing-card timing-card-highlight">
              <h3>Neurology — Dr. Khandait</h3>
              <p>Monday – Saturday</p>
              <p className="timing-detail">{clinic.neuroTiming}</p>
              <p className="text-body-sm">Ideal for working professionals who cannot visit during the day</p>
            </div>
            <div className="timing-card">
              <h3>Front Desk</h3>
              <p>All departments</p>
              <p className="timing-detail"><a href={`tel:+91${clinic.phone}`}>{clinic.phoneDisplay}</a></p>
              <p className="text-body-sm"><a href={`mailto:${clinic.email}`}>{clinic.email}</a></p>
              {clinic.hours && <p className="text-body-sm">{clinic.hours}</p>}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">How to Reach Us</div>
            <h2>{page.directionsTitle}</h2>
          </div>
          <div className="directions-grid reveal">
            <div className="direction-card">
              <h3>Landmark</h3>
              <p>{clinic.landmark}. Look for the white board with the teal infinity mark at the gate.</p>
            </div>
            <div className="direction-card">
              <h3>From Manewada</h3>
              <p>{clinic.directionsFrom || 'Head towards Omkar Nagar on Manewada Ring Road.'}</p>
            </div>
            <div className="direction-card">
              <h3>Parking</h3>
              <p>{clinic.parking}</p>
            </div>
            <div className="direction-card">
              <h3>What to Bring</h3>
              <p>{clinic.whatToBring}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-light">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">First Visit</div>
            <h2>{page.firstVisitTitle}</h2>
          </div>
          <div className="steps-grid reveal">
            {visitSteps.map((s) => (
              <div key={s.step} className="step-card">
                <span className="step-num">{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">FAQ</div>
            <h2>{page.faqTitle}</h2>
          </div>
          <div className="faq-list reveal">
            {faq.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand showBook />
    </>
  );
}
