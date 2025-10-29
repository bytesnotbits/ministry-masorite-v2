// src/components/AddStudyModal.jsx

import { useState, useEffect } from 'react';
import './AddTerritoryModal.css'; // Reuse CSS

function AddStudyModal({ onSave, onClose, person }) {
  const [publication, setPublication] = useState('');
  const [currentLesson, setCurrentLesson] = useState('');

  const handleSaveClick = () => {
    if (!publication.trim() || !currentLesson.trim()) {
      alert('Please fill out both the publication and the lesson number.');
      return;
    }

    const studyData = {
      personId: person.id,
      publication: publication.trim(),
      currentLesson: currentLesson.trim(),
      isActive: true, // New studies are active by default
      goals: [], // Start with an empty goals array
      createdAt: new Date().toISOString()
    };

    onSave(studyData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Start New Bible Study</h3>
        <p>For: <strong>{person.name}</strong></p>
        
        <label htmlFor="study-publication">Publication</label>
        <input
          type="text"
          id="study-publication"
          placeholder="e.g., Enjoy Life Forever!"
          value={publication}
          onChange={(e) => setPublication(e.target.value)}
          autoFocus
        />

        <label htmlFor="study-lesson">Lesson</label>
        <input
          type="text"
          id="study-lesson"
          placeholder="e.g., 1"
          value={currentLesson}
          onChange={(e) => setCurrentLesson(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save Study</button>
        </div>
      </div>
    </div>
  );
}

export default AddStudyModal;