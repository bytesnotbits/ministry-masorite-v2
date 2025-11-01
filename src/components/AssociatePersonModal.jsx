import React, { useState, useEffect } from 'react';
import { getAllFromStore, getByIndex } from '../database.js';
import './AddTerritoryModal.css'; // Re-using styles

function AssociatePersonModal({ person, onSave, onClose }) {
  const [territories, setTerritories] = useState([]);
  const [streets, setStreets] = useState([]);
  const [houses, setHouses] = useState([]);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState('');
  const [selectedStreetId, setSelectedStreetId] = useState('');
  const [selectedHouseId, setSelectedHouseId] = useState('');

  useEffect(() => {
    async function fetchTerritories() {
      const allTerritories = await getAllFromStore('territories');
      setTerritories(allTerritories);
    }
    fetchTerritories();
  }, []);

  useEffect(() => {
    async function fetchStreets() {
      if (selectedTerritoryId) {
        const streetsForTerritory = await getByIndex('streets', 'territoryId', selectedTerritoryId);
        setStreets(streetsForTerritory);
      } else {
        setStreets([]);
      }
    }
    fetchStreets();
  }, [selectedTerritoryId]);

  useEffect(() => {
    async function fetchHouses() {
      if (selectedStreetId) {
        const housesForStreet = await getByIndex('houses', 'streetId', selectedStreetId);
        setHouses(housesForStreet);
      } else {
        setHouses([]);
      }
    }
    fetchHouses();
  }, [selectedStreetId]);

  const handleSave = () => {
    if (selectedHouseId) {
      onSave(person, selectedHouseId);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Associate {person.name} with a House</h2>
        
        <label htmlFor="territory-select">Territory</label>
        <select id="territory-select" value={selectedTerritoryId} onChange={e => setSelectedTerritoryId(Number(e.target.value))}>
          <option value="">Select a Territory</option>
          {territories.map(t => <option key={t.id} value={t.id}>{t.number}</option>)}
        </select>

        <label htmlFor="street-select">Street</label>
        <select id="street-select" value={selectedStreetId} onChange={e => setSelectedStreetId(Number(e.target.value))} disabled={!selectedTerritoryId}>
          <option value="">Select a Street</option>
          {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <label htmlFor="house-select">House</label>
        <select id="house-select" value={selectedHouseId} onChange={e => setSelectedHouseId(Number(e.target.value))} disabled={!selectedStreetId}>
          <option value="">Select a House</option>
          {houses.map(h => <option key={h.id} value={h.id}>{h.address}</option>)}
        </select>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave} disabled={!selectedHouseId}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AssociatePersonModal;
