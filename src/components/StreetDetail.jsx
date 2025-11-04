import { useState, useEffect } from 'react';
import './HouseDetail.css'; // We can reuse the same styles for consistency!
import ViewHeader from './ViewHeader.jsx';

// CHANGE 1: Accept the 'onCancel' prop
function StreetDetail({ street, onSave, onDelete, onCancel }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
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
    if (window.confirm('Are you sure you want to permanently delete this street and all the houses within it? This cannot be undone.')) {
      onDelete(street.id);
    }
  };

  if (!formData) {
    return <p>Loading street details...</p>;
  }

  return (
    <div className="house-detail-container">
      <ViewHeader title="Edit Street">
        <button className="secondary-action-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-action-btn" onClick={handleSave}>
          Save Changes
        </button>
      </ViewHeader>

      <form className="house-form">
        <label htmlFor="name">Street Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        {/* CHANGE 3: Move the delete button into a styled Danger Zone */}
        <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p>This action is permanent and cannot be undone.</p>
            <button type="button" className="danger-action-btn" onClick={handleDelete}>
                Delete Street
            </button>
        </div>
      </form>
    </div>
  );
}

export default StreetDetail;
