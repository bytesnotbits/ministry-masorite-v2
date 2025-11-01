import './FilterBar.css';

function FilterBar({ filters, onFilterChange, availableFilters }) {
  const handleToggle = (filterKey) => {
    onFilterChange({
      ...filters,
      [filterKey]: !filters[filterKey]
    });
  };

  const filterConfig = {
    showNotAtHome: { label: 'Not at Home', icon: '🏠' },
    showNotInterested: { label: 'Not Interested', icon: '🚫' },
    showGate: { label: 'Gate', icon: '🚧' },
    showMailbox: { label: 'Mailbox', icon: '📬' },
    showNoTrespassing: { label: 'No Trespassing', icon: '⛔' }
  };

  return (
    <div className="filter-bar">
      <div className="filter-label">Show:</div>
      <div className="filter-buttons">
        {availableFilters.map(filterKey => {
          const config = filterConfig[filterKey];
          const isActive = filters[filterKey];

          return (
            <button
              key={filterKey}
              className={`filter-btn ${isActive ? 'active' : 'inactive'}`}
              onClick={() => handleToggle(filterKey)}
              title={`${isActive ? 'Hide' : 'Show'} ${config.label}`}
            >
              <span className="filter-icon">{config.icon}</span>
              <span className="filter-text">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterBar;
