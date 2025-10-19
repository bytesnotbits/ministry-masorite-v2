import './TerritoryList.css';

// This is now a "dumb" component. It just receives props and displays them.
function TerritoryList({ territories, onTerritorySelect, onAddTerritory }) {
  return (
    <div className="territory-list-container">
      <div className="view-header">
        <h2>Territories</h2>
        <button className="primary-action-btn" onClick={onAddTerritory}>
          + Add New Territory
        </button>
      </div>

      <ul className="territory-list">
        {territories.map(territory => (
          <li
            key={territory.id}
            className="territory-item"
            onClick={() => onTerritorySelect(territory.id)}
          >
            <div className="territory-number">Territory #{territory.number}</div>
            <div className="territory-description">{territory.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TerritoryList;