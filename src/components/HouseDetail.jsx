import { useState, useEffect } from 'react';
import './HouseDetail.css';
import VisitList from './VisitList.jsx';
import { getByIndex } from '../database.js';
import PeopleList from './PeopleList.jsx';


function HouseDetail({ house, onSave, onDelete, onAddVisit, onDeleteVisit, onEditVisit, onAddPerson, onDeletePerson, onEditPerson, visitListKey }) {
  // NEW STATE: This will control whether we are in "view" or "edit" mode.
  // It starts as 'false' (view mode).
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    setFormData(house);
  }, [house]);

  useEffect(() => {
    // This function fetches the visits for the current house
    const fetchVisits = async () => {
      if (house?.id) {
        const visitData = await getByIndex('visits', 'houseId', house.id);
        // We'll sort them so the most recent visit is at the top
        visitData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setVisits(visitData);
      }
    };

    fetchVisits();
  }, [house?.id, visitListKey]); // Re-run this effect if the house ID changes

    useEffect(() => {
    const fetchPeople = async () => {
      if (house?.id) {
        const peopleData = await getByIndex('people', 'houseId', house.id);
        // Sort people alphabetically by name for consistent order
        peopleData.sort((a, b) => a.name.localeCompare(b.name));
        setPeople(peopleData);
      }
    };

    fetchPeople();
  }, [house?.id]); // This also runs when the house ID changes

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSave = () => {
    onSave(formData);
    setIsEditing(false); // After saving, switch back to view mode
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this house? This cannot be undone.')) {
      onDelete(house.id);
    }
  };

  // NEW HANDLER: This resets any changes and returns to view mode.
  const handleCancel = () => {
    setFormData(house); // Reset form data to the original prop
    setIsEditing(false); // Switch back to view mode
  };

  if (!formData) {
    return <p>Loading house details...</p>;
  }

  // --- NEW RENDER LOGIC --- NEW RENDER LOGIC --- NEW RENDER LOGIC --- NEW RENDER LOGIC --- NEW RENDER LOGIC --- NEW RENDER LOGIC --- NEW RENDER LOGIC ---
  return (
    <div className="house-detail-container">
      {/* This is a ternary operator. It checks if we are in "editing" mode. */}
      {isEditing ? (
        /* If isEditing is TRUE, render the EDITING VIEW (the form) */
        <>
          <div className="view-header">
            <h2>Edit House</h2>
            <button className="primary-action-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
          <form className="house-form">
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
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="button" className="btn-danger" onClick={handleDelete}>
                Delete House
              </button>
            </div>
          </form>
        </>
      ) : (
        /* If isEditing is FALSE, render the READ-ONLY VIEW */
        <>
          <div className="view-header">
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
          </div>
          <div className="house-details-readonly">
            <h3>Notes</h3>
            {/* Show a message if notes are empty */}
            <p>{house.notes || <em>No notes recorded.</em>}</p> 
            
            <h3>Status</h3>
            <p>{house.isNotInterested ? 'Not Interested' : 'Unvisited'}</p>
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
        />
        </>
      )}
    </div>
  );
}

export default HouseDetail;
