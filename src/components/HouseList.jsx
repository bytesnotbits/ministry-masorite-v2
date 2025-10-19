// src/components/HouseList.jsx

import { useState, useEffect } from 'react';
import { getByIndex } from '../database.js';
import './HouseList.css'; // 1. Import our new CSS

// 2. Accept the props from App.jsx
function HouseList({ streetId, onBack }) {
  const [houses, setHouses] = useState([]);

  // 3. Use useEffect to fetch houses when streetId changes
  useEffect(() => {
    const fetchHouses = async () => {
      const data = await getByIndex('houses', 'streetId', streetId);
      // Let's sort the houses numerically by address
      data.sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true }));
      setHouses(data);
    };

    fetchHouses();
  }, [streetId]); // The dependency array ensures this runs when the street changes

  return (
    <div>
      {/* 4. Use the onBack prop for the button */}
      <button onClick={onBack}>&larr; Back to Streets</button>
      <h2>Houses</h2>

      {/* 5. Map over the houses state to display the list */}
      <ul className="house-list">
        {houses.map(house => (
          <li key={house.id} className="house-item">
            <div className="house-address">{house.address}</div>
            {/* We will add more details here later */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HouseList;