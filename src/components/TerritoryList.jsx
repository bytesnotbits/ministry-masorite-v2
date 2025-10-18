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
    <div>
        <h2>Territories</h2>
        <ul>
        {territories.map(territory => (
            <li key={territory.id}>
            Territory #{territory.number}: {territory.description}
            </li>
        ))}
        </ul>
    </div>
    );
}

export default TerritoryList;