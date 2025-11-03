// src/components/StreetList.jsx

import { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import './StreetList.css';
import ViewHeader from './ViewHeader.jsx';
import StatIcon from './StatIcon.jsx';
import CompletionToggle from './CompletionToggle.jsx';
import './StatIcon.css';

// Accept the new onStreetSelect prop
function StreetList({ territoryId, onStreetSelect, onAddStreet, onEditTerritory, showCompleted, onToggleCompleted }) {
  const [streets, setStreets] = useState([]);
  const [territoryDetails, setTerritoryDetails] = useState(null);


useEffect(() => {
    const fetchStreetsAndStats = async () => {
      // 1. Get the territory object (same as before)
      const territoryObject = await getFromStore('territories', territoryId);
      setTerritoryDetails(territoryObject);

      // 2. Get the streets for that territory (same as before)
      const streetData = await getByIndex('streets', 'territoryId', territoryId);

      // 3. NEW: Create a list of promises to fetch houses for EACH street
      const streetWithStatsPromises = streetData.map(async (street) => {
        const housesForStreet = await getByIndex('houses', 'streetId', street.id);
        // Return a new object that combines the original street with its houses
        return { ...street, houses: housesForStreet };
      });

      // 4. NEW: Wait for ALL of those promises to finish
      const streetsWithStats = await Promise.all(streetWithStatsPromises);

      // 5. Set the final, enriched list into state
      setStreets(streetsWithStats);
    };

    fetchStreetsAndStats();
  }, [territoryId]);

  // Helper function to check if a street is completed
  // A street is completed when ALL houses have isCurrentlyNH = false (no more not-at-homes)
  const isStreetCompleted = (street) => {
    if (!street.houses || street.houses.length === 0) return false; // Empty streets are not completed
    return street.houses.every(house => !house.isCurrentlyNH);
  };

  // Filter streets: hide completed ones if showCompleted is false
  const filteredStreets = streets.filter(street => {
    if (showCompleted) return true; // Show all if toggle is on
    return !isStreetCompleted(street); // Hide completed if toggle is off
  });

  return (
    <div>
      <ViewHeader title={territoryDetails ? `Territory #${territoryDetails.number}` : 'Loading...'}>
        <button className="secondary-action-btn" onClick={() => onEditTerritory(territoryId)}>
          Edit Territory
        </button>
        <button className="primary-action-btn" onClick={onAddStreet}>
          + Add New Street
        </button>
      </ViewHeader>

      <CompletionToggle
        showCompleted={showCompleted}
        onToggle={onToggleCompleted}
      />

      {/* Add the className and onClick handler */}
      <ul className="street-list">
        {filteredStreets.map(street => {
          const isCompleted = isStreetCompleted(street);
          return (
        <li
          key={street.id}
          className={`street-item ${isCompleted ? 'completed' : ''}`}
          onClick={() => onStreetSelect(street.id)}
        >
          <div className="street-header">
            <div className="street-name">{street.name}</div>
            <div className="street-stats">
              {(() => {
                const totalHouses = street.houses ? street.houses.length : 0;
                const visitedHouses = street.houses ? street.houses.filter(h => !h.isCurrentlyNH).length : 0;
                return `${visitedHouses} of ${totalHouses} Visited`;
              })()}
            </div>
          </div>

          <div className="street-stats-container">
            <StatIcon
              iconName="notAtHome"
              count={street.houses ? street.houses.filter(h => h.isCurrentlyNH).length : 0}
            />
            <StatIcon
              iconName="notInterested"
              count={street.houses ? street.houses.filter(h => h.isNotInterested).length : 0}
            />
            <StatIcon
              iconName="gate"
              count={street.houses ? street.houses.filter(h => h.hasGate).length : 0}
            />
            <StatIcon
              iconName="noTrespassing"
              count={street.houses ? street.houses.filter(h => h.noTrespassing).length : 0}
            />
          </div>
        </li>
          );
        })}
      </ul>
    </div>
  );
}
export default StreetList;