// src/components/StreetList.jsx

import { useState, useEffect } from 'react';
import { getByIndex } from '../database.js';
import './StreetList.css';

// Accept the new onStreetSelect prop
function StreetList({ territoryId, onStreetSelect, onBack, onAddStreet, onEditTerritory }) {
  const [streets, setStreets] = useState([]);

  useEffect(() => {
    const fetchStreets = async () => {
      const data = await getByIndex('streets', 'territoryId', territoryId);
      setStreets(data);
    };

    fetchStreets();
  }, [territoryId]);

  return (
    <div>
      <button onClick={onBack} className="back-button">&larr; Territories</button>
      <div className="view-header">
        <h2>Streets</h2>
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