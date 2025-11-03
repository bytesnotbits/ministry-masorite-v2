import React, { useState } from 'react';

function AddLetterCampaignModal({ onSave, onClose }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>New Letter Campaign</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign Name"
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddLetterCampaignModal;
