import { STATUS_HELP } from './portalHelp.js';

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ') || 'unknown';
  const hint = STATUS_HELP[status];
  return (
    <span className={`badge badge-${status}`} title={hint || undefined}>
      {label}
    </span>
  );
}

