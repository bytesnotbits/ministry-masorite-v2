import { useState, useEffect } from 'react';
import './HouseDetail.css';
import VisitList from './VisitList.jsx';
import { getByIndex } from '../database.js';
import PeopleList from './PeopleList.jsx';
import Icon from './Icon.jsx';
import ViewHeader from './ViewHeader.jsx';


function HouseDetail({ house, people, onSave, onDelete, onAddVisit, onDeleteVisit, onEditVisit, onAddPerson, onDeletePerson, onEditPerson, visitListKey, onStartStudy, onViewStudy, onDisassociatePerson, onMovePerson }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    setFormData(house);
    // When the house changes, we should exit editing mode.
    setIsEditing(false);
  }, [house]);

  useEffect(() => {
    const fetchVisits = async () => {
      if (house?.id) {
        const visitData = await getByIndex('visits', 'houseId', house.id);
        visitData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setVisits(visitData);
      }
    };

    fetchVisits();
  }, [house?.id, visitListKey]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this house? This cannot be undone.')) {
      onDelete(house.id);
    }
  };

  const handleCancel = () => {
    setFormData(house);
    setIsEditing(false);
  };

  if (!formData) {
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
      <h2>{house.address}</h2>
      {/* --- RENDER LOGIC --- */}
      {/* Check if we are in "editing" mode. */}
      {isEditing ? (
        
        /* If isEditing is TRUE, render the EDITING VIEW (the form) */
        <>
        <ViewHeader title="Editing House">
          <button className="secondary-action-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="primary-action-btn" onClick={handleSave}>
            Save Changes
          </button>
        </ViewHeader>
          
          {/* A simple form for editing */}
          <div className="house-details-form">
            <label htmlFor="address">Address</label>
            <input 
              type="text" 
              name="address" 
              id="address"
              value={formData.address || ''} 
              onChange={handleChange} 
            />
            
            <label htmlFor="notes">Notes</label>
            <textarea 
              name="notes" 
              id="notes"
              value={formData.notes || ''} 
              onChange={handleChange} 
              rows="4"
            ></textarea>
          </div>

          <div className="danger-zone">
             <button className="danger-action-btn" onClick={handleDelete}>
                Delete this House Permanently
            </button>
          </div>
        </>

      ) : (

        /* If isEditing is FALSE, render the VIEWING VIEW (the details) */
        <>
        <ViewHeader>
          <div className="header-actions">
            <button className="primary-action-btn" onClick={onAddPerson}>
              + Add Person
            </button>
            <button className="primary-action-btn" onClick={onAddVisit}>
              + Add Visit
            </button>
          </div>
          <button className="secondary-action-btn" onClick={() => setIsEditing(true)}>
              Edit House
          </button>
        </ViewHeader>

          <div className="house-details-readonly">
            <h3>Notes</h3>
            <p>{house.notes || <em>No notes recorded.</em>}</p> 
            
            <h3>Details</h3>
            <div className="details-grid">
                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="isCurrentlyNH"
                      checked={house.isCurrentlyNH || false}
                      onChange={handleToggleChange}
                    />
                    <span>Not at Home</span>
                    <Icon name="notAtHome" className="detail-icon icon-nh" />
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="isNotInterested"
                      checked={house.isNotInterested || false}
                      onChange={handleToggleChange}
                    />
                    <span>Not Interested</span>
                    <Icon name="notInterested" className="detail-icon icon-ni" />
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="hasMailbox"
                      checked={house.hasMailbox || false}
                      onChange={handleToggleChange}
                    />
                    <span>Mailbox Available</span>
                    <Icon name="mailbox" className="detail-icon icon-mailbox" />
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="noTrespassing"
                      checked={house.noTrespassing || false}
                      onChange={handleToggleChange}
                    />
                    <span>No Trespassing</span>
                    <Icon name="noTrespassing" className="detail-icon icon-no-trespassing" />
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="hasGate"
                      checked={house.hasGate || false}
                      onChange={handleToggleChange}
                    />
                    <span>Gated Property</span>
                    <Icon name="gate" className="detail-icon icon-gate" />
                  </label>
            </div>
          </div>

          <VisitList 
              visits={visits} 
              onDelete={onDeleteVisit} 
              onEdit={onEditVisit} 
              people={people}
          />

          <PeopleList
              people={people}
              onDelete={onDeletePerson}
              onEdit={onEditPerson}
              onStartStudy={onStartStudy}
              onViewStudy={onViewStudy}
              onDisassociate={onDisassociatePerson}
              onMove={onMovePerson}
          />
        </>
      )}
    </div>
  );
}

export default HouseDetail;