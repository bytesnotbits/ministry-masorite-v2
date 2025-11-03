import React, { useState } from 'react';

function EditLetterCampaignModal({ campaign, onSave, onClose }) {
  const [name, setName] = useState(campaign.name);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ ...campaign, name });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Letter Campaign</h2>
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

export default EditLetterCampaignModal;
