import { Link } from 'react-router-dom';
import { useWebsite } from './WebsiteContext.jsx';
import PageHero from './components/PageHero.jsx';
import CtaBand from './components/CtaBand.jsx';

export default function AboutPage() {
  const { clinic, about, whyCards, visitSteps } = useWebsite();

  return (
    <>
      <PageHero
        eyebrow={about.eyebrow || `About ${clinic.name}`}
        title={about.title}
        lede={about.lede || about.body}
      />

      <section className="section-light">
        <div className="wrap about-story">
          {about.story.map((para, i) => (
            <p key={i} className="about-para reveal">{para}</p>
          ))}
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">What We Stand For</div>
            <h2>Three principles behind every OPD.</h2>
          </div>
          <div className="why-grid reveal">
            {about.values.map((v) => (
              <div key={v.title} className="why-card">
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-light">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Why Choose Us</div>
            <h2>{about.whyTitle || `What makes ${clinic.name} different.`}</h2>
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
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="eyebrow">Your First Visit</div>
            <h2>How it works — from call to consultation.</h2>
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
          <div className="hero-cta" style={{ marginTop: 40, justifyContent: 'center' }}>
            <Link to="/book" className="btn btn-primary">Book your first visit</Link>
            <a className="btn btn-ghost" href={`tel:+91${clinic.phone}`}>Call {clinic.phoneDisplay}</a>
          </div>
        </div>
      </section>

      <CtaBand title="Ready to visit?" subtitle="Five specialists, one address on Manewada Ring Road." />
    </>
  );
}
