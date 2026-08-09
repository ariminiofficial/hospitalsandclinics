export default function FieldLabel({ title, hint, children, className = '' }) {
  return (
    <div className={`field-label-wrap ${className}`.trim()}>
      <span className="field-label-title">{title}</span>
      {hint && <span className="field-label-hint">{hint}</span>}
      {children}
    </div>
  );
}
