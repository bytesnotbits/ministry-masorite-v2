import React, { useState, useEffect } from 'react';
import './MovePersonModal.css';

function MovePersonModal({ person, onSave, onClose, territories }) {
  const [streets, setStreets] = useState([]);
  const [houses, setHouses] = useState([]);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState('');
  const [selectedStreetId, setSelectedStreetId] = useState('');
  const [selectedHouseId, setSelectedHouseId] = useState('');

  useEffect(() => {
    // Territories are passed as prop
  }, [territories]);

  useEffect(() => {
    if (selectedTerritoryId && territories) {
      const territory = territories.find(t => t.id === selectedTerritoryId);
      setStreets(territory ? territory.streets : []);
    } else {
      setStreets([]);
    }
  }, [selectedTerritoryId, territories]);

  useEffect(() => {
    if (selectedStreetId && streets) {
      const street = streets.find(s => s.id === selectedStreetId);
      setHouses(street ? street.houses : []);
    } else {
      setHouses([]);
    }
  }, [selectedStreetId, streets]);

  const handleSave = () => {
    if (selectedHouseId) {
      onSave(person, selectedHouseId);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Move {person.name} to a new House</h2>

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

export default MovePersonModal;
