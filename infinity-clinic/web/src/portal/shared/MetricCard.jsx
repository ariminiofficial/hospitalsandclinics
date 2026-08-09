export default function MetricCard({ value, label, description }) {
  return (
    <div className="metric-card">
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
      {description && <span className="metric-desc">{description}</span>}
    </div>
  );
}
