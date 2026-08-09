import { useWebsite } from '../WebsiteContext.jsx';

export default function LocationBlock({ dark = true }) {
  const { clinic } = useWebsite();

  return (
    <div className="loc-grid">
      <div className="loc-card reveal">
        <div className="loc-line"><div className="ic">Address</div><div className="v">{clinic.address}</div></div>
        <div className="loc-line"><div className="ic">Phone</div><div className="v"><a href={`tel:+91${clinic.phone}`}>{clinic.phoneDisplay}</a> — all five departments</div></div>
        <div className="loc-line"><div className="ic">Email</div><div className="v"><a href={`mailto:${clinic.email}`}>{clinic.email}</a></div></div>
        <div className="loc-line"><div className="ic">Landmark</div><div className="v">{clinic.landmark}</div></div>
        <div className="loc-line"><div className="ic">Neuro OPD</div><div className="v">Evenings, 7:00 PM – 9:00 PM · Dr. Pranit Khandait</div></div>
        <div className="loc-line"><div className="ic">Other OPDs</div><div className="v">{clinic.hours}</div></div>
        <div className="loc-line"><div className="ic">Parking</div><div className="v">{clinic.parking}</div></div>
      </div>
      <div className={`map-embed reveal ${dark ? '' : 'map-embed-light'}`}>
        <iframe
          title={`${clinic.name} location`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${clinic.mapQuery}&output=embed`}
        />
      </div>
    </div>
  );
}
