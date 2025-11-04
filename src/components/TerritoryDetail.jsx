// src/components/TerritoryDetail.jsx

import './HouseDetail.css'; // Reusing styles for a consistent look!
import ViewHeader from './ViewHeader.jsx';
import LongPressEditField from './LongPressEditField.jsx';

function TerritoryDetail({ territory, onSave, onDelete, onCancel }) {
  const handleFieldSave = (fieldName, value) => {
    const updatedTerritory = {
      ...territory,
      [fieldName]: value
    };
    onSave(updatedTerritory);
  };

  const handleDelete = () => {
    // Show a confirmation dialog before this destructive action
    if (window.confirm('Are you sure you want to permanently delete this territory and ALL streets and houses within it? This cannot be undone.')) {
      onDelete(territory.id);
    }
  };

  if (!territory) {
    return <p>Loading territory details...</p>;
  }

  return (
    <div className="house-detail-container">
      <ViewHeader title="Territory Details">
        <button className="secondary-action-btn" onClick={onCancel}>
          Back to List
        </button>
      </ViewHeader>

      <div className="house-details-section">
        <LongPressEditField
          label="Territory Number"
          value={territory.number}
          onSave={(value) => handleFieldSave('number', value)}
          placeholder="No number set"
        />

        <LongPressEditField
          label="Description"
          value={territory.description}
          onSave={(value) => handleFieldSave('description', value)}
          placeholder="No description"
        />
      </div>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>This action is permanent and cannot be undone.</p>
        <button type="button" className="danger-action-btn" onClick={handleDelete}>
          Delete Territory
        </button>
      </div>
    </div>
  );
}

export default TerritoryDetail;