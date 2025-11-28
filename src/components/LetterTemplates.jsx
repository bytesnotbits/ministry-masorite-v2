import React, { useState, useEffect } from 'react';
import AddLetterTemplateModal from './AddLetterTemplateModal';
import EditLetterTemplateModal from './EditLetterTemplateModal';
import './LetterTemplates.css';

function LetterTemplates({ onBack }) {
  const [templates, setTemplates] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    // const allTemplates = await getLetterTemplates();
    const response = await fetch('http://localhost:3001/api/letter-templates');
    const allTemplates = await response.json();
    setTemplates(allTemplates);
  };

  const handleSave = async (template) => {
    // await addLetterTemplate(template);
    await fetch('http://localhost:3001/api/letter-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    fetchTemplates();
  };

  const handleUpdate = async (template) => {
    // await updateLetterTemplate(template);
    await fetch(`http://localhost:3001/api/letter-templates/${template.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    fetchTemplates();
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      // await deleteLetterTemplate(templateId);
      await fetch(`http://localhost:3001/api/letter-templates/${templateId}`, {
        method: 'DELETE'
      });
      fetchTemplates();
    }
  };

  const handleEdit = (template) => {
    setTemplateToEdit(template);
    setIsEditModalOpen(true);
  };

  return (
    <div className="letter-templates">
      <button className="breadcrumb-button" onClick={onBack}>&larr; Back</button>
      <h2>Letter Templates</h2>
      <div className="header-actions">
        <button className="primary-action-btn" onClick={() => setIsAddModalOpen(true)}>
          + New Template
        </button>
      </div>
      <ul>
        {templates.map(template => (
          <li key={template.id}>
            <span>{template.name}</span>
            <div>
              <button className="secondary-action-btn" onClick={() => handleEdit(template)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(template.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {isAddModalOpen && (
        <AddLetterTemplateModal
          onSave={handleSave}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {isEditModalOpen && (
        <EditLetterTemplateModal
          template={templateToEdit}
          onSave={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

export default LetterTemplates;
