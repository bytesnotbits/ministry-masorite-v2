import { useState, useEffect } from 'react';
import { getAllFromStore } from '../database.js'; // Note the path change

function TerritoryList() {
  const [territories, setTerritories] = useState([]);

  useEffect(() => {
    // This function is defined inside useEffect to use async/await
    const fetchTerritories = async () => {
      const data = await getAllFromStore('territories');
      setTerritories(data);
    };

    fetchTerritories();
  }, []); // The empty array means this effect runs only once

  // For now, let's just log the data to see if it worked
  console.log('Territories loaded into state:', territories);

  return (
    <div className="territory-list-container">
        <h2>Territories</h2>
        <ul className="territory-list">
        {territories.map(territory => (
            <li key={territory.id} className="territory-item">
            <div className="territory-number">Territory #{territory.number}</div>
            <div className="territory-description">{territory.description}</div>
            </li>
        ))}
        </ul>
    </div>
    );
}

export default TerritoryList;