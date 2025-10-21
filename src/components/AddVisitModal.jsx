// src/components/AddVisitModal.jsx

import { useState } from 'react';
import './AddTerritoryModal.css'; // We can reuse the same CSS for a consistent look!

function AddVisitModal({ onSave, onClose }) {
  // Default the date to today in the YYYY-MM-DD format required by the input
  const today = new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');

  const handleSaveClick = () => {
    // Basic validation
    if (!date) {
      alert('Please select a date for the visit.');
      return;
    }

    // This is the new visit object.
    // The houseId will be added later in App.jsx.
    const newVisit = {
      date: date,
      notes: notes,
    };

    onSave(newVisit);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add New Visit</h3>
        
        <label htmlFor="visit-date">Date of Visit</label>
        <input
          type="date"
          id="visit-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label htmlFor="visit-notes">Notes</label>
        <textarea
          id="visit-notes"
          placeholder="e.g., Placed magazine, had a brief conversation..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="4"
          autoFocus
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save Visit</button>
        </div>
      </div>
    </div>
  );
}

export default AddVisitModal;