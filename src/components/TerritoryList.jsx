import './TerritoryList.css';
import ViewHeader from './ViewHeader.jsx';
import StatIcon from './StatIcon.jsx';
import FilterBar from './FilterBar.jsx';
import './StatIcon.css';


// This is now a "dumb" component. It just receives props and displays them.
function TerritoryList({ territories, onTerritorySelect, onAddTerritory, onOpenSettings, onOpenBibleStudies, filters, onFilterChange }) {
  // Helper function to check if a house passes the filters
  const housePassesFilters = (house) => {
    if (!filters.showNotAtHome && house.isCurrentlyNH) return false;
    if (!filters.showNotInterested && house.isNotInterested) return false;
    if (!filters.showGate && house.hasGate) return false;
    if (!filters.showMailbox && house.hasMailbox) return false;
    if (!filters.showNoTrespassing && house.noTrespassing) return false;
    return true;
  };

  // Filter territories: only show territories that have at least one house passing the filters
  const filteredTerritories = territories.filter(territory => {
    if (!territory.houses || territory.houses.length === 0) return true; // Show empty territories
    // Show territory if at least one house passes the filters
    return territory.houses.some(house => housePassesFilters(house));
  });

  return (
    <div className="territory-list-container">
      <ViewHeader>
        <button className="secondary-action-btn" onClick={onOpenBibleStudies}>
          RVs / Bible Studies
        </button>
        <button className="secondary-action-btn" onClick={onOpenSettings}>
          Settings
        </button>
        <button className="primary-action-btn" onClick={onAddTerritory}>
          + Add New Territory
        </button>
      </ViewHeader>

      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        availableFilters={['showNotAtHome', 'showNotInterested', 'showGate', 'showMailbox', 'showNoTrespassing']}
      />

        <ul className="territory-list">
          {filteredTerritories.map(territory => (

/* The logic is exactly the same as in StreetList, but we're using territory.houses instead of street.houses.
We've wrapped the original number and description in a <div className="territory-details">.
We've created a new container, <div className="territory-stats-container">, to hold all our stats.
The "Visited" count is now in a div with a unique class, territory-stat-pill, to avoid any style conflicts. */
          <li
            key={territory.id}
            className="territory-item"
            onClick={() => onTerritorySelect(territory.id)}
          >
            <div className="territory-details">
              <div className="territory-number">Territory #{territory.number}</div>
              <div className="territory-description">{territory.description}</div>
            </div>
            
            <div className="territory-stats-container">
              <div className="territory-stat-pill">
                {(() => {
                  const totalHouses = territory.houses ? territory.houses.length : 0;
                  const visitedHouses = territory.houses ? territory.houses.filter(h => !h.isCurrentlyNH).length : 0;
                  return `${visitedHouses} of ${totalHouses} Visited`;
                })()}
              </div>
              
              <StatIcon 
                iconName="notAtHome" 
                count={territory.houses ? territory.houses.filter(h => h.isCurrentlyNH).length : 0} 
              />
              <StatIcon 
                iconName="notInterested" 
                count={territory.houses ? territory.houses.filter(h => h.isNotInterested).length : 0} 
              />
              <StatIcon 
                iconName="gate" 
                count={territory.houses ? territory.houses.filter(h => h.hasGate).length : 0} 
              />
              <StatIcon 
                iconName="noTrespassing" 
                count={territory.houses ? territory.houses.filter(h => h.noTrespassing).length : 0} 
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TerritoryList;