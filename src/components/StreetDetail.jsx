import './HouseDetail.css'; // We can reuse the same styles for consistency!
import ViewHeader from './ViewHeader.jsx';
import LongPressEditField from './LongPressEditField.jsx';

function StreetDetail({ street, onSave, onDelete, onCancel }) {
  const handleFieldSave = (fieldName, value) => {
    const updatedStreet = {
      ...street,
      [fieldName]: value
    };
    onSave(updatedStreet);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this street and all the houses within it? This cannot be undone.')) {
      onDelete(street.id);
    }
  };

  if (!street) {
    return <p>Loading street details...</p>;
  }

  return (
    <div className="house-detail-container">
      <ViewHeader title="Street Details">
        <button className="secondary-action-btn" onClick={onCancel}>
          Back to List
        </button>
      </ViewHeader>

      <div className="house-details-section">
        <LongPressEditField
          label="Street Name"
          value={street.name}
          onSave={(value) => handleFieldSave('name', value)}
          placeholder="No name set"
        />
      </div>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>This action is permanent and cannot be undone.</p>
        <button type="button" className="danger-action-btn" onClick={handleDelete}>
          Delete Street
        </button>
      </div>
    </div>
  );
}

export default StreetDetail;
