// src/components/AddStreetModal.jsx

import { useState } from 'react';
import './AddTerritoryModal.css'; // We can reuse the same CSS!

function AddStreetModal({ onSave, onClose }) {
  const [name, setName] = useState('');

  const handleSave = (closeModal) => {
    if (!name.trim()) {
      alert('Please enter a street name.');
      return;
    }

    // This is the new street object we will save.
    // We will add the territoryId to it later, in App.jsx.
    const newStreet = {
      name: name,
    };

    // Call the function passed down from the parent with closeModal flag
    onSave(newStreet, closeModal);

    if (!closeModal) {
      // Save & New: clear the form, keep modal open
      setName('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add New Street</h3>
        
        <label htmlFor="street-name">Street Name</label>
        <input
          type="text"
          id="street-name"
          placeholder="e.g., Main St, County Rd 123"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus // This is a nice touch to put the cursor in the box automatically
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => handleSave(false)}>Save & New</button>
          <button className="btn-primary" onClick={() => handleSave(true)}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}

export default AddStreetModal;