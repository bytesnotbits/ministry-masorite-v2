// src/components/AddHouseModal.jsx

import { useState } from 'react';
import './AddTerritoryModal.css'; // We can reuse the same CSS for consistency!

function AddHouseModal({ onSave, onClose }) {
  const [address, setAddress] = useState('');

  const handleSave = (closeModal) => {
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

    // Call the function passed down from the parent with closeModal flag
    onSave(newHouse, closeModal);

    if (!closeModal) {
      // Save & New: clear the form, keep modal open
      setAddress('');
    }
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
          <button className="btn-primary" onClick={() => handleSave(false)}>Save & New</button>
          <button className="btn-primary" onClick={() => handleSave(true)}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}

export default AddHouseModal;