export default function SectionIntro({ title, description }) {
  return (
    <div className="section-intro">
      <h2 className="section-intro-title">{title}</h2>
      {description && <p className="section-intro-desc">{description}</p>}
    </div>
  );
}
