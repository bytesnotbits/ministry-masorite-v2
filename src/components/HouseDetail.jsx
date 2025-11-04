import { useState, useEffect } from 'react';
import './HouseDetail.css';
import VisitList from './VisitList.jsx';
import { getByIndex } from '../database.js';
import PeopleList from './PeopleList.jsx';
import Icon from './Icon.jsx';
import ViewHeader from './ViewHeader.jsx';
import LongPressEditField from './LongPressEditField.jsx';
import InlineEditableText from './InlineEditableText.jsx';


function HouseDetail({ house, people, onSave, onDelete, onAddVisit, onDeleteVisit, onEditVisit, onAddPerson, onDeletePerson, onEditPerson, visitListKey, onStartStudy, onViewStudy, onDisassociatePerson, onMovePerson, setIsEditingHouse, onQuickLetter }) {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    const fetchVisits = async () => {
      if (house?.id) {
        const visitData = await getByIndex('visits', 'houseId', house.id);
        // Sort by date and time (most recent first)
        visitData.sort((a, b) => {
          const dateTimeA = `${a.date} ${a.time || '00:00'}`;
          const dateTimeB = `${b.date} ${b.time || '00:00'}`;
          return new Date(dateTimeA) - new Date(dateTimeB);
        });
        // Reverse to get newest first
        visitData.reverse();
        setVisits(visitData);
      }
    };

    fetchVisits();
  }, [house?.id, visitListKey]);



  const handleFieldSave = (fieldName, value) => {
    const updatedHouse = {
      ...house,
      [fieldName]: value
    };
    onSave(updatedHouse, true); // Pass true to stay on the house detail page
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this house? This cannot be undone.')) {
      onDelete(house.id);
    }
  };

  if (!house) {
    return <p>Loading house details...</p>;
  }

  const handleToggleChange = (e) => {
      const { name, checked } = e.target;
      const updatedHouse = {
        ...house,
        [name]: checked
      };
      onSave(updatedHouse, true);
    };
  
  return (
    <div className="house-detail-container">
      <InlineEditableText
        value={house.address}
        onSave={(value) => handleFieldSave('address', value)}
        as="h2"
        placeholder="No address set"
      />

      <ViewHeader>
        <div className="header-actions">
          <button className="primary-action-btn" onClick={onAddPerson}>
            + Add Person
          </button>
          <button className="primary-action-btn" onClick={() => onAddVisit()}>
            + Add Visit
          </button>
          <button className="primary-action-btn" onClick={onQuickLetter}>
            Quick Letter
          </button>
        </div>
      </ViewHeader>

      <div className="house-details-section">
        <LongPressEditField
          label="Notes"
          value={house.notes}
          onSave={(value) => handleFieldSave('notes', value)}
          multiline={true}
          placeholder="No notes recorded."
        />

        <h3>Details</h3>
        <div className="details-grid">
          <label className="detail-toggle-button">
            <input
              type="checkbox"
              name="isCurrentlyNH"
              checked={house.isCurrentlyNH || false}
              onChange={handleToggleChange}
            />
            <span>NH</span>
            <Icon name="notAtHome" className="detail-icon icon-nh" />
          </label>

          <label className="detail-toggle-button">
            <input
              type="checkbox"
              name="isNotInterested"
              checked={house.isNotInterested || false}
              onChange={handleToggleChange}
            />
            <span>NI</span>
            <Icon name="notInterested" className="detail-icon icon-ni" />
          </label>

          <label className="detail-toggle-button">
            <input
              type="checkbox"
              name="hasMailbox"
              checked={house.hasMailbox || false}
              onChange={handleToggleChange}
            />
            <span>Mailbox</span>
            <Icon name="mailbox" className="detail-icon icon-mailbox" />
          </label>

          <label className="detail-toggle-button">
            <input
              type="checkbox"
              name="noTrespassing"
              checked={house.noTrespassing || false}
              onChange={handleToggleChange}
            />
            <span>NT</span>
            <Icon name="noTrespassing" className="detail-icon icon-no-trespassing" />
          </label>

          <label className="detail-toggle-button">
            <input
              type="checkbox"
              name="hasGate"
              checked={house.hasGate || false}
              onChange={handleToggleChange}
            />
            <span>Gate</span>
            <Icon name="gate" className="detail-icon icon-gate" />
          </label>
        </div>
      </div>

      <PeopleList
        people={people}
        onDelete={onDeletePerson}
        onEdit={onEditPerson}
        onStartStudy={onStartStudy}
        onViewStudy={onViewStudy}
        onDisassociate={onDisassociatePerson}
        onMove={onMovePerson}
      />

      <VisitList
        visits={visits}
        onDelete={onDeleteVisit}
        onEdit={onEditVisit}
        people={people}
      />

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>This action is permanent and cannot be undone.</p>
        <button className="danger-action-btn" onClick={handleDelete}>
          Delete this House Permanently
        </button>
      </div>
    </div>
  );
}

export default HouseDetail;