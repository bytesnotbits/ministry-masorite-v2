import { useState, useEffect } from 'react';
import './AddTerritoryModal.css'; // Reuse the same CSS for consistency

function AddPersonModal({ onSave, onClose, personToEdit }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (personToEdit) {
      // Edit mode: pre-fill the form
      setName(personToEdit.name);
    } else {
      // Add mode: clear the form
      setName('');
    }
  }, [personToEdit]);

  const handleSaveClick = () => {
    if (!name.trim()) {
      alert('Please enter a name for the person.');
      return;
    }

    const personData = {
      name: name.trim(),
    };

    // Pass both the data and the original object (if editing)
    onSave(personData, personToEdit);
  };

  // Determine the title based on whether we are adding or editing
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

        {/* We can add more fields here later, like phone number or notes */}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save Person</button>
        </div>
      </div>
    </div>
  );
}

export default AddPersonModal;