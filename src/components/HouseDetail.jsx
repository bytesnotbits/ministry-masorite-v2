// src/components/HouseDetail.jsx

import { useState, useEffect } from 'react';
import './HouseDetail.css';

// 1. Accept the new 'onDelete' prop
function HouseDetail({ house, onBack, onSave, onDelete }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    setFormData(house);
  }, [house]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = () => {
    onSave(formData);
  };

  // 2. Create a handler for the delete button
  const handleDelete = () => {
    // Show a native browser confirmation dialog
    if (window.confirm('Are you sure you want to permanently delete this house? This cannot be undone.')) {
      onDelete(house.id); // If user clicks "OK", call the onDelete prop with the house ID
    }
  };

  if (!formData) {
    return <p>Loading house details...</p>;
  }

  return (
    <div className="house-detail-container">
      {/* ... (Back button and header are the same) ... */}
      <button onClick={onBack}>&larr; Back to Houses</button>
      <div className="view-header">
        <h2>Edit House</h2>
        <button className="primary-action-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <form className="house-form">
        {/* ... (form inputs are the same) ... */}
        <label htmlFor="address">Address</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows="4"
        ></textarea>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isNotInterested"
              checked={formData.isNotInterested || false}
              onChange={handleChange}
            />
            Not Interested
          </label>
        </div>

        {/* 3. Wire up the onClick event for the delete button */}
        <button type="button" className="btn-danger" onClick={handleDelete}>
          Delete House
        </button>
      </form>
    </div>
  );
}

export default HouseDetail;