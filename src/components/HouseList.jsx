// src/components/HouseList.jsx

import { useState, useEffect } from 'react';
import { getByIndex } from '../database.js';
import './HouseList.css';

// Note the new 'onHouseSelect' prop
function HouseList({ streetId, onBack, onAddHouse, onHouseSelect, onEditStreet }) {
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    const fetchHouses = async () => {
      const data = await getByIndex('houses', 'streetId', streetId);
      data.sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true }));
      setHouses(data);
    };

    fetchHouses();
  }, [streetId]);

  return (
    <div>
      <button onClick={onBack} className="back-button">&larr; Streets</button>
      
      <div className="view-header">
            <h2>Houses</h2>
            <div className="header-actions">
                <button className="secondary-action-btn" onClick={() => onEditStreet(streetId)}>
                Edit Street
                </button>
                <button className="primary-action-btn" onClick={onAddHouse}>
                + Add New House
                </button>
            </div>
        </div>

      <ul className="house-list">
        {houses.map(house => (
          <li 
            key={house.id} 
            className="house-item"
            onClick={() => onHouseSelect(house)}
          >
            <div className="house-address">{house.address}</div>
            {/* This is the new part: a conditional span */}
            {house.isNotInterested && <span className="dnc-tag">Not Interested</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HouseList;