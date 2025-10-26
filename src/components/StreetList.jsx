// src/components/StreetList.jsx

import { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import './StreetList.css';

// Accept the new onStreetSelect prop
function StreetList({ territoryId, onStreetSelect, onAddStreet, onEditTerritory }) {
  const [streets, setStreets] = useState([]);
  const [territoryDetails, setTerritoryDetails] = useState(null);


  useEffect(() => {
    const fetchStreets = async () => {
      // Get the territory object and store it in state
      const territoryObject = await getFromStore('territories', territoryId);
      console.log('Territory Object:', territoryObject);
      setTerritoryDetails(territoryObject);

      // Get the streets for that territory
      const data = await getByIndex('streets', 'territoryId', territoryId);
      setStreets(data);
    };

    fetchStreets();
  }, [territoryId]);

  return (
    <div>
      {territoryDetails && <h2>Territory #{territoryDetails.number}</h2>}
      <div className="view-header">
        <div className="header-actions">
            <button className="secondary-action-btn" onClick={() => onEditTerritory(territoryId)}>
            Edit Territory
            </button>
            <button className="primary-action-btn" onClick={onAddStreet}>
            + Add New Street
            </button>
        </div>
    </div>


      {/* Add the className and onClick handler */}
      <ul className="street-list">
        {streets.map(street => (
          <li
            key={street.id}
            className="street-item"
            onClick={() => onStreetSelect(street.id)}
            >
            {street.name}
            </li>
          ))}
      </ul>
    </div>
  );
}
export default StreetList;