export default function PortalToolbar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusFilter,
  onStatusChange,
  statusOptions,
  children,
  resultCount,
  totalCount,
}) {
  return (
    <div className="portal-toolbar">
      {onSearchChange && (
        <input
          type="search"
          className="search-input portal-toolbar-search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search"
        />
      )}
      <div className="portal-filters portal-toolbar-filters">
        {statusOptions && onStatusChange && (
          <label className="portal-select-label">
            Status
            <select
              className="portal-select"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              title={statusOptions.find((o) => o.value === statusFilter)?.hint || 'Filter by visit status'}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value} title={o.hint}>{o.label}</option>
              ))}
            </select>
          </label>
        )}
        {children}
      </div>
      {resultCount !== undefined && totalCount !== undefined && (
        <p className="portal-toolbar-count text-body-sm">
          Showing {resultCount} of {totalCount}
        </p>
      )}
    </div>
  );
}
