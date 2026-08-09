export default function PageHero({ eyebrow, title, lede, children }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        {eyebrow && <div className="eyebrow reveal">{eyebrow}</div>}
        <h1 className="reveal">{title}</h1>
        {lede && <p className="page-hero-lede reveal">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
