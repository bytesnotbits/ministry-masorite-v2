import './TerritoryList.css';
import ViewHeader from './ViewHeader.jsx';


// This is now a "dumb" component. It just receives props and displays them.
function TerritoryList({ territories, onTerritorySelect, onAddTerritory, }) {
  return (
    <div className="territory-list-container">
      <ViewHeader>
        <button className="primary-action-btn" onClick={onAddTerritory}>
          + Add New Territory
        </button>
      </ViewHeader>

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