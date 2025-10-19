// src/components/StreetList.jsx

import { useState, useEffect } from 'react';
import { getByIndex } from '../database.js'; // We need getByIndex this time

// 1. Accept the 'onBack' prop here
function StreetList({ territoryId, onBack }) {
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
      {/* 2. Add the back button */}
      <button onClick={onBack}>&larr; Back to Territories</button>
      
      <h2>Streets</h2>
      <ul>
        {streets.map(street => (
          <li key={street.id}>
            {street.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StreetList;