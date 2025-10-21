// src/components/StreetDetail.jsx

import { useState, useEffect } from 'react';
import './HouseDetail.css'; // We can reuse the same styles for consistency!

function StreetDetail({ street, onSave, onDelete }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // When the 'street' prop changes, update our local form state
    setFormData(street);
  }, [street]);

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
    // Show a confirmation dialog before deleting
    if (window.confirm('Are you sure you want to permanently delete this street and all the houses within it? This cannot be undone.')) {
      onDelete(street.id);
    }
  };

  // Don't render the form until the data is loaded
  if (!formData) {
    return <p>Loading street details...</p>;
  }

  return (
    <div className="house-detail-container">
      <div className="view-header">
        <h2>Edit Street</h2>
        <button className="primary-action-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <form className="house-form">
        <label htmlFor="name">Street Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <button type="button" className="btn-danger" onClick={handleDelete}>
          Delete Street
        </button>
      </form>
    </div>
  );
}

export default StreetDetail;