import { useWebsite } from './WebsiteContext.jsx';
import PageHero from './components/PageHero.jsx';
import CtaBand from './components/CtaBand.jsx';

export default function TestimonialsPage() {
  const { testimonials, loaded, pages } = useWebsite();
  const page = pages.testimonials;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lede={page.lede}
      />

      <section>
        <div className="wrap">
          <div className="testimonial-stats reveal">
            <div><span className="stat-n">5</span><span className="stat-l">Specialities</span></div>
            <div><span className="stat-n">4.9</span><span className="stat-l">Average rating</span></div>
            <div><span className="stat-n">1</span><span className="stat-l">Address for all</span></div>
          </div>

          <div className="testimonial-grid reveal">
            {testimonials.map((t, i) => (
              <div key={t.id || i} className="testimonial-card">
                <div className="testimonial-stars">{'★'.repeat(t.rating || 5)}</div>
                {t.department && <span className="testimonial-dept">{t.department}</span>}
                <p className="testimonial-quote">&ldquo;{t.content}&rdquo;</p>
                <p className="testimonial-author">— {t.patient_name}</p>
              </div>
            ))}
          </div>

          {!loaded && <p className="lede">Loading stories...</p>}
        </div>
      </section>

      <section className="section-light">
        <div className="wrap">
          <div className="info-callout reveal">
            <h3>{page.calloutTitle}</h3>
            <p>{page.calloutBody}</p>
          </div>
        </div>
      </section>

      <CtaBand title={page.ctaTitle} subtitle={page.ctaSubtitle} />
    </>
  );
}
