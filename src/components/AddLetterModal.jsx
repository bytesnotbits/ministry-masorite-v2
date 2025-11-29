import React, { useState, useEffect } from 'react';
import { getLetterTemplates } from '../database-api';

function AddLetterModal({ onSave, onClose, territories }) {
  const [houseId, setHouseId] = useState('');
  const [houses, setHouses] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchHouses();
    fetchTemplates();
  }, [territories]);

  const fetchHouses = () => {
    if (territories) {
      const allHouses = [];
      territories.forEach(t => {
        t.streets.forEach(s => {
          s.houses.forEach(h => {
            allHouses.push({ ...h, address: h.address });
          });
        });
      });
      setHouses(allHouses);
    }
  };

  const fetchTemplates = async () => {
    try {
      const allTemplates = await getLetterTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleSave = () => {
    if (houseId) {
      onSave({ houseId, templateId });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>New Letter</h2>
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

export default AddLetterModal;
