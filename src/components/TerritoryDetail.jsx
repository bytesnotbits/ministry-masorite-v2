// src/components/TerritoryDetail.jsx

import { useState, useEffect } from 'react';
import './HouseDetail.css'; // Reusing styles for a consistent look!

function TerritoryDetail({ territory, onSave, onDelete }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // When the component receives a territory, set it as the form's state
    setFormData(territory);
  }, [territory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    onSave(formData);
  };

  const handleDelete = () => {
    // Show a confirmation dialog before this destructive action
    if (window.confirm('Are you sure you want to permanently delete this territory and ALL streets and houses within it? This cannot be undone.')) {
      onDelete(territory.id);
    }
  };

  // Don't render the form until the data is loaded
  if (!formData) {
    return <p>Loading territory details...</p>;
  }

  return (
    <div className="house-detail-container">
      <div className="view-header">
        <h2>Edit Territory</h2>
        <button className="primary-action-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <form className="house-form">
        <label htmlFor="number">Territory Number</label>
        <input
          type="text"
          id="number"
          name="number"
          value={formData.number}
          onChange={handleChange}
        />

        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <button type="button" className="btn-danger" onClick={handleDelete}>
          Delete Territory
        </button>
      </form>
    </div>
  );
}

export default TerritoryDetail;