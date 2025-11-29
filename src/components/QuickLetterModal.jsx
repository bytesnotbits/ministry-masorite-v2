import React, { useState, useEffect } from 'react';
import { getLetterTemplates } from '../database-api';

function QuickLetterModal({ house, onSave, onClose }) {
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const allTemplates = await getLetterTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleSave = () => {
    if (templateId) {
      onSave({ houseId: house.id, templateId });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Quick Letter to {house.address}</h2>
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          <option value="">Select a template</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default QuickLetterModal;
