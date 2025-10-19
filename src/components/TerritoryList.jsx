// src/components/TerritoryList.jsx

import { useState, useEffect } from 'react';
import { getAllFromStore } from '../database.js';
import './TerritoryList.css';

// 1. Add { onTerritorySelect } here to accept the prop
function TerritoryList({ onTerritorySelect }) { 
  const [territories, setTerritories] = useState([]);

  useEffect(() => {
    const fetchTerritories = async () => {
      const data = await getAllFromStore('territories');
      setTerritories(data);
    };
    fetchTerritories();
  }, []);

  return (
    <div className="territory-list-container">
      <h2>Territories</h2>
      <ul className="territory-list">
        {territories.map(territory => (
          // 2. Add the onClick handler to the <li>
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