// src/components/StreetList.jsx

import { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import './StreetList.css';
import ViewHeader from './ViewHeader.jsx';
import StatIcon from './StatIcon.jsx';
import CompletionToggle from './CompletionToggle.jsx';
import InlineEditableText from './InlineEditableText.jsx';
import LongPressEditField from './LongPressEditField.jsx';
import './StatIcon.css';

// Accept the new onStreetSelect prop
function StreetList({ territory, onStreetSelect, onAddStreet, onSaveTerritory, showCompleted, onToggleCompleted, onDeleteStreet }) {
  const { streets, ...territoryDetails } = territory;

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

  const handleFieldSave = (fieldName, value) => {
    const updatedTerritory = {
      ...territoryDetails,
      [fieldName]: value
    };
    onSaveTerritory(updatedTerritory);
  };

  if (!territoryDetails) {
    return <p>Loading territory details...</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <InlineEditableText
          value={`Territory #${territoryDetails.number}`}
          onSave={(value) => {
            // Extract just the number from "Territory #XX"
            const match = value.match(/\d+/);
            if (match) {
              handleFieldSave('number', match[0]);
            }
          }}
          as="h2"
          placeholder="Territory #"
        />
      </div>

      <ViewHeader>
        <button className="primary-action-btn" onClick={onAddStreet}>
          + Add New Street
        </button>
      </ViewHeader>

      <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
        <LongPressEditField
          label="Description"
          value={territoryDetails.description}
          onSave={(value) => handleFieldSave('description', value)}
          placeholder="No description"
        />
      </div>

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
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteStreet(street);
            }}
          >
            &times;
          </button>
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