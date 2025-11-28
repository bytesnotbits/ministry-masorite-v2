import React, { useState, useEffect } from 'react';

function EditLetterModal({ letter, onSave, onClose, territories }) {
  const [houseId, setHouseId] = useState(letter.houseId);
  const [houses, setHouses] = useState([]);
  const [templateId, setTemplateId] = useState(letter.templateId);
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
    // const allTemplates = await getAllFromStore('letterTemplates');
    const response = await fetch('http://localhost:3001/api/letter-templates');
    const allTemplates = await response.json();
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
