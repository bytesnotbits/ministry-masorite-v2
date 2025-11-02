import './TerritoryList.css';
import ViewHeader from './ViewHeader.jsx';
import StatIcon from './StatIcon.jsx';
import CompletionToggle from './CompletionToggle.jsx';
import './StatIcon.css';


// This is now a "dumb" component. It just receives props and displays them.
function TerritoryList({ territories, onTerritorySelect, onAddTerritory, onOpenSettings, onOpenBibleStudies, showCompleted, onToggleCompleted }) {
  // Helper function to check if a territory is completed
  // A territory is completed when ALL houses have isCurrentlyNH = false (no more not-at-homes)
  const isTerritoryCompleted = (territory) => {
    if (!territory.houses || territory.houses.length === 0) return false; // Empty territories are not completed
    return territory.houses.every(house => !house.isCurrentlyNH);
  };

  // Filter territories: hide completed ones if showCompleted is false
  const filteredTerritories = territories.filter(territory => {
    if (showCompleted) return true; // Show all if toggle is on
    return !isTerritoryCompleted(territory); // Hide completed if toggle is off
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

      <CompletionToggle
        showCompleted={showCompleted}
        onToggle={onToggleCompleted}
      />

        <ul className="territory-list">
          {filteredTerritories.map(territory => {
            const isCompleted = isTerritoryCompleted(territory);
            return (

/* The logic is exactly the same as in StreetList, but we're using territory.houses instead of street.houses.
We've wrapped the original number and description in a <div className="territory-details">.
We've created a new container, <div className="territory-stats-container">, to hold all our stats.
The "Visited" count is now in a div with a unique class, territory-stat-pill, to avoid any style conflicts. */
          <li
            key={territory.id}
            className={`territory-item ${isCompleted ? 'completed' : ''}`}
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
            );
          })}
      </ul>
    </div>
  );
}

export default TerritoryList;