// src/components/HouseList.jsx

import { useState, useEffect } from 'react';
import { getByIndex } from '../database.js';
import './HouseList.css';

// Note the new 'onHouseSelect' prop
function HouseList({ streetId, onBack, onAddHouse, onHouseSelect }) {
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
      <button onClick={onBack}>&larr; Back to Streets</button>
      
      <div className="view-header">
        <h2>Houses</h2>
        <button className="primary-action-btn" onClick={onAddHouse}>
          + Add New House
        </button>
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