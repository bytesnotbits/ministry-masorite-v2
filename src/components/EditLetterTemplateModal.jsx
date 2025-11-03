import React, { useState } from 'react';

function EditLetterTemplateModal({ template, onSave, onClose }) {
  const [name, setName] = useState(template.name);
  const [text, setText] = useState(template.text);

  const handleSave = () => {
    if (name.trim() && text.trim()) {
      onSave({ ...template, name, text });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Letter Template</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template Name"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Template Text"
        ></textarea>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default EditLetterTemplateModal;
