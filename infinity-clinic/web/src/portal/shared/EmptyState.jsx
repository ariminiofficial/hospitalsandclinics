export default function EmptyState({ icon = '◎', message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p>{message}</p>
      {action}
    </div>
  );
}
