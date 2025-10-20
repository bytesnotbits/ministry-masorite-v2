// src/components/AddHouseModal.jsx

import { useState } from 'react';
import './AddTerritoryModal.css'; // We can reuse the same CSS for consistency!

function AddHouseModal({ onSave, onClose }) {
  const [address, setAddress] = useState('');

  const handleSaveClick = () => {
    if (!address.trim()) {
      alert('Please enter an address or house number.');
      return;
    }

    // This is the new house object.
    // The streetId will be added in App.jsx.
    const newHouse = {
      address: address,
      isNotInterested: false,
      isCurrentlyNH: true, // Default a new house to "Not at Home"
      hasGate: false,
      hasMailbox: false,
      noTrespassing: false,
      notes: "" // Start with empty notes
    };

    onSave(newHouse);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add New House</h3>
        
        <label htmlFor="house-address">Address / House Number</label>
        <input
          type="text"
          id="house-address"
          placeholder="e.g., 123, 45B, Apt 6"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoFocus // Automatically focus the input field
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddHouseModal;