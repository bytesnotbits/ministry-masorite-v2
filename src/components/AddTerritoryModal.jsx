import { useState } from 'react';
import './AddTerritoryModal.css';

// It now receives onSave and onClose
function AddTerritoryModal({ onSave, onClose }) {
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveClick = () => {
    // Basic validation
    if (!number.trim() || !description.trim()) {
      alert('Please fill out both fields.');
      return;
    }

    // Create the new territory object
    const newTerritory = {
      number: number,
      description: description,
      createdAt: new Date().toISOString(),
    };

    // Call the function passed down from the parent
    onSave(newTerritory);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add New Territory</h3>
        
        <label htmlFor="territory-number">Territory Number</label>
        <input
          type="text"
          id="territory-number"
          placeholder="e.g., 5, 1-7, LTR-02"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />

        <label htmlFor="territory-description">Description</label>
        <input
          type="text"
          id="territory-description"
          placeholder="e.g., Walking, Business District"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {/* The Save button now calls our new handler */}
          <button className="btn-primary" onClick={handleSaveClick}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddTerritoryModal;