// src/components/AddVisitModal.jsx

import { useState, useEffect } from 'react'; // <-- Make sure useEffect is imported
import './AddTerritoryModal.css';

function AddVisitModal({ onSave, onClose, visitToEdit, people, personForVisit }) { // <-- Accept the new prop
  
  // State for the form fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [personId, setPersonId] = useState('');
  const [type, setType] = useState('Regular');


  // This effect runs when the modal opens or when the visitToEdit prop changes
  useEffect(() => {
    if (visitToEdit) {
      // EDIT MODE: We have a visit to edit, so pre-fill the form.
      // We only take the YYYY-MM-DD part of the string to avoid any time/timezone data.
      setDate(visitToEdit.date.substring(0, 10));
      setTime(visitToEdit.time || '');
      setNotes(visitToEdit.notes || '');
      setPersonId(visitToEdit.personId || '');
      setType(visitToEdit.type || 'Regular'); // Default to Regular for old visits
    } else {
      // ADD MODE: No visit to edit, so set defaults for a new visit.
      const today = new Date(); // Creates a date object using the user's local clock.

      const year = today.getFullYear();
      // getMonth() is 0-indexed (0-11), so we add 1.
      // String().padStart(2, '0') ensures we have a leading '0' for single-digit months/days.
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');

      // Manually build the string. This is immune to time zone conversion.
      const todayString = `${year}-${month}-${day}`;
      const timeString = `${hours}:${minutes}`;

      setDate(todayString);
      setTime(timeString);
      setNotes('');
      setPersonId(personForVisit ? personForVisit.id : '');
      setType('Regular'); // Default to Regular for new visits
    }
  }, [visitToEdit, personForVisit]); // This effect depends on the visitToEdit and personForVisit props

    const handleSaveClick = () => {
    if (!date) {
        alert('Please select a date for the visit.');
        return;
    }

    if (!time) {
        alert('Please select a time for the visit.');
        return;
    }

    // Create the visit data object from the form
    const visitData = {
        date: date, // Date is required
        time: time, // Time is required
        notes: notes, // Notes can be empty
        personId: personId ? parseInt(personId, 10) : null, // Convert to integer or null
        type: type, // Visit type
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

        <label htmlFor="visit-time">Time of Visit</label>
        <input
          type="time"
          id="visit-time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <label htmlFor="visit-type">Visit Type</label>
        <select
          id="visit-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Regular">Regular Visit</option>
          <option value="Not At Home">Not At Home</option>
          <option value="LETTER">Letter Sent</option>
          <option value="Letter Response">Letter Response</option>
          <option value="Phone Call">Phone Call</option>
          <option value="SYSTEM">System</option>
        </select>

        <label htmlFor="visit-notes">Notes</label>
        <textarea
          id="visit-notes"
          placeholder="e.g., Placed magazine, had a brief conversation..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="4"
          autoFocus
        />

        {/* --- START: New Person Dropdown --- */}
        {people && people.length > 0 && (
          <>
            <label htmlFor="visit-person">Link Visit To (Optional)</label>
            <select
              id="visit-person"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              <option value="">General Visit (No Specific Person)</option>
              {people.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </>
        )}
        {/* --- END: New Person Dropdown --- */}
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save Visit</button>
        </div>
      </div>
    </div>
  );
}

export default AddVisitModal;