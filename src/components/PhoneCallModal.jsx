// src/components/PhoneCallModal.jsx

import { useState, useEffect } from 'react';
import './AddTerritoryModal.css';

function PhoneCallModal({ house, onSave, onClose }) {
  const [callOutcome, setCallOutcome] = useState('');
  const [personSpokenWith, setPersonSpokenWith] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    setCallOutcome('');
    setPersonSpokenWith('');
    setNotes('');
  }, [house]);

  const handleSaveClick = () => {
    if (!callOutcome) {
      alert('Please select a call outcome.');
      return;
    }

    // Build the notes field with all the information
    let fullNotes = `Call Outcome: ${callOutcome}`;

    if (personSpokenWith.trim()) {
      fullNotes += `\nPerson Spoken With: ${personSpokenWith.trim()}`;
    }

    if (notes.trim()) {
      fullNotes += `\n${notes.trim()}`;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    // Create visit data object
    const visitData = {
      date: todayString,
      notes: fullNotes,
      personId: null,
      type: 'Phone Call',
    };

    onSave(visitData, house.id);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Log Phone Call</h3>

        <label htmlFor="call-outcome">Call Outcome</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            className={`btn-outcome ${callOutcome === 'No Answer' ? 'selected' : ''}`}
            onClick={() => setCallOutcome('No Answer')}
            style={{
              flex: 1,
              padding: '10px',
              border: callOutcome === 'No Answer' ? '2px solid #4a90e2' : '1px solid #ccc',
              backgroundColor: callOutcome === 'No Answer' ? '#e3f2fd' : 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            No Answer
          </button>
          <button
            className={`btn-outcome ${callOutcome === 'Left Voicemail' ? 'selected' : ''}`}
            onClick={() => setCallOutcome('Left Voicemail')}
            style={{
              flex: 1,
              padding: '10px',
              border: callOutcome === 'Left Voicemail' ? '2px solid #4a90e2' : '1px solid #ccc',
              backgroundColor: callOutcome === 'Left Voicemail' ? '#e3f2fd' : 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Left Voicemail
          </button>
        </div>

        <label htmlFor="person-spoken-with">Person Spoken With (optional)</label>
        <input
          type="text"
          id="person-spoken-with"
          placeholder="e.g., Jane Doe (optional)"
          value={personSpokenWith}
          onChange={(e) => setPersonSpokenWith(e.target.value)}
          style={{ marginBottom: '15px' }}
        />

        <label htmlFor="call-notes">Notes</label>
        <textarea
          id="call-notes"
          placeholder="Details of the conversation..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="4"
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default PhoneCallModal;
