// src/components/AddVisitModal.jsx

import { useState, useEffect } from 'react'; // <-- Make sure useEffect is imported
import './AddTerritoryModal.css';

function AddVisitModal({ onSave, onClose, visitToEdit }) { // <-- Accept the new prop
  
  // State for the form fields
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // This effect runs when the modal opens or when the visitToEdit prop changes
  useEffect(() => {
    if (visitToEdit) {
      // EDIT MODE: We have a visit to edit, so pre-fill the form.
      // We only take the YYYY-MM-DD part of the string to avoid any time/timezone data.
      setDate(visitToEdit.date.substring(0, 10)); 
      setNotes(visitToEdit.notes || '');
    } else {
      // ADD MODE: No visit to edit, so set defaults for a new visit.
      
      // --- The 100% Reliable Time Zone Fix ---
      const today = new Date(); // Creates a date object using the user's local clock.
    
      const year = today.getFullYear();
      // getMonth() is 0-indexed (0-11), so we add 1.
      // String().padStart(2, '0') ensures we have a leading '0' for single-digit months/days.
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      // Manually build the string. This is immune to time zone conversion.
      const todayString = `${year}-${month}-${day}`;
      
      setDate(todayString);
      setNotes('');
    }
  }, [visitToEdit]); // This effect depends on the visitToEdit prop

    const handleSaveClick = () => {
    if (!date) {
        alert('Please select a date for the visit.');
        return;
    }

    // Create the visit data object from the form
    const visitData = {
        date: date,
        notes: notes,
    };

    // Call the onSave function passed from App.jsx
    // If we are editing, visitToEdit will be an object. If we are adding, it will be null.
    onSave(visitData, visitToEdit); 
    };

  return ( // --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---
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