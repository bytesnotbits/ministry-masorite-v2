// src/components/EditStudyModal.jsx

import { useState, useEffect } from 'react';
import './AddTerritoryModal.css'; // Reuse CSS

function EditStudyModal({ onSave, onClose, study }) {
  const [publication, setPublication] = useState('');
  const [lesson, setLesson] = useState('');

  useEffect(() => {
    if (study) {
      setPublication(study.publication || '');
      setLesson(study.lesson || '');
    }
  }, [study]);

  const handleSaveClick = () => {
    if (!publication.trim() || !lesson.trim()) {
      alert('Please fill out both the publication and the lesson number.');
      return;
    }

    const updatedStudyData = {
      ...study,
      publication: publication.trim(),
      lesson: lesson.trim(),
    };

    onSave(updatedStudyData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Bible Study</h3>
        <p>For: <strong>{study.person.name}</strong></p>
        
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
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveClick}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default EditStudyModal;