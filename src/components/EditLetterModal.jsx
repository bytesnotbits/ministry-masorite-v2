import React, { useState, useEffect } from 'react';
import { getAllFromStore } from '../database.js';

function EditLetterModal({ letter, onSave, onClose }) {
  const [houseId, setHouseId] = useState(letter.houseId);
  const [houses, setHouses] = useState([]);
  const [templateId, setTemplateId] = useState(letter.templateId);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchHouses();
    fetchTemplates();
  }, []);

  const fetchHouses = async () => {
    const allHouses = await getAllFromStore('houses');
    setHouses(allHouses);
  };

  const fetchTemplates = async () => {
    const allTemplates = await getAllFromStore('letterTemplates');
    setTemplates(allTemplates);
  };

  const handleSave = () => {
    if (houseId) {
      onSave({ ...letter, houseId, templateId });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Letter</h2>
        <select value={houseId} onChange={(e) => setHouseId(e.target.value)}>
          <option value="">Select a house</option>
          {houses.map(house => (
            <option key={house.id} value={house.id}>{house.address}</option>
          ))}
        </select>
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          <option value="">Select a template</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default EditLetterModal;
