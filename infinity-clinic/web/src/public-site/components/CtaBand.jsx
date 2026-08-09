import { Link } from 'react-router-dom';
import { useWebsite } from '../WebsiteContext.jsx';

export default function CtaBand({ title, subtitle, showBook = true }) {
  const { clinic, cta } = useWebsite();

  return (
    <div className="cta-band">
      <div className="wrap reveal">
        <h2>{title || cta.title}</h2>
        <p>{subtitle || cta.subtitle}</p>
        <div className="hero-cta">
          <a className="btn btn-primary" href={`tel:+91${clinic.phone}`}>Call {clinic.phoneDisplay}</a>
          {showBook && <Link className="btn btn-ghost" to="/book">Book Online</Link>}
          <a className="btn btn-ghost" href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
