import React, { useState, useEffect } from 'react';
import { getLetterTemplates, addLetterTemplate, deleteLetterTemplate, updateLetterTemplate } from '../database-api.js';
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
    const allTemplates = await getLetterTemplates();
    setTemplates(allTemplates);
  };

  const handleSave = async (template) => {
    await addLetterTemplate(template);
    fetchTemplates();
  };

  const handleUpdate = async (template) => {
    await updateLetterTemplate(template);
    fetchTemplates();
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteLetterTemplate(templateId);
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
