import { useState, useEffect } from 'react';
import './AddTerritoryModal.css'; // Reuse the same CSS for consistency

function AddPersonModal({ onSave, onClose, personToEdit }) {
  // --- CHANGE 1: Add state for notes ---
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (personToEdit) {
      // Edit mode: pre-fill the form with name and notes
      setName(personToEdit.name);
      setNotes(personToEdit.notes || ''); // Use existing notes or an empty string
    } else {
      // Add mode: clear the form
      setName('');
      setNotes('');
    }
  }, [personToEdit]);

  const handleSaveClick = () => {
    if (!name.trim()) {
      alert('Please enter a name for the person.');
      return;
    }

    // --- CHANGE 2: Add notes to the saved data ---
    const personData = {
      name: name.trim(),
      notes: notes.trim(), // Include the notes
    };

    onSave(personData, personToEdit);
  };

  const modalTitle = personToEdit ? 'Edit Person' : 'Add New Person';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{modalTitle}</h3>
        
        <label htmlFor="person-name">Name</label>
        <input
          type="text"
          id="person-name"
          placeholder="e.g., Jane Doe, The man with the dog"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* --- CHANGE 3: Add the textarea for notes --- */}
        <label htmlFor="person-notes">Notes</label>
        <textarea
          id="person-notes"
          placeholder="e.g., Works nights, interested in..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="4"
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save Person</button>
        </div>
      </div>
    </div>
  );
}

export default AddPersonModal;