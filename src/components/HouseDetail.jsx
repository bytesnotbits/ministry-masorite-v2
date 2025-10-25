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

  const handleToggleChange = (e) => {
      const { name, checked } = e.target;
      
      // Create a new, updated version of the house data
      const updatedHouse = {
        ...house, // Copy all existing properties from the original house
        [name]: checked // Overwrite the specific property that was changed
      };
      
      // Call the onSave function from App.jsx, passing true to stay on the page
      onSave(updatedHouse, true);
    };
  
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

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isCurrentlyNH"
                  checked={formData.isCurrentlyNH || false}
                  onChange={handleChange}
                />
                Not at Home
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasMailbox"
                  checked={formData.hasMailbox || false}
                  onChange={handleChange}
                />
                Mailbox
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="noTrespassing"
                  checked={formData.noTrespassing || false}
                  onChange={handleChange}
                />
                No Trespassing
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasGate"
                  checked={formData.hasGate || false}
                  onChange={handleChange}
                />
                Gated
              </label>
            </div>

            {/* --- START: New Checkbox --- */}
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isCurrentlyNH"
                  checked={formData.isCurrentlyNH || false}
                  onChange={handleChange}
                />
                Currently Not at Home
              </label>
            </div>
            {/* --- END: New Checkbox --- */}

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
            
            <h3>Details</h3>
                <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="isCurrentlyNH"
                      checked={house.isCurrentlyNH || false}
                      onChange={handleToggleChange}
                    />
                    <span>Not at Home</span>
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="isNotInterested"
                      checked={house.isNotInterested || false}
                      onChange={handleToggleChange}
                    />
                    <span>Not Interested</span>
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="hasMailbox"
                      checked={house.hasMailbox || false}
                      onChange={handleToggleChange}
                    />
                    <span>Mailbox Available</span>
                    <svg className="detail-icon icon-mailbox" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"></path></svg>
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="noTrespassing"
                      checked={house.noTrespassing || false}
                      onChange={handleToggleChange}
                    />
                    <span>No Trespassing</span>
                    <svg className="detail-icon icon-no-trespassing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7v-2z"></path></svg>
                  </label>

                  <label className="detail-toggle-button">
                    <input
                      type="checkbox"
                      name="hasGate"
                      checked={house.hasGate || false}
                      onChange={handleToggleChange}
                    />
                    <span>Gated Property</span>
                    <svg className="detail-icon icon-gate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 7v10h-2v-2h-2v2h-2v-2h-2v2h-2v-2H9v2H7v-2H5v2H3V7h2v2h2V7h2v2h2V7h2v2h2V7h2v2h2V7h2M5 5v2H3V5h2m16 0v2h-2V5h2m-4 0v2h-2V5h2m-4 0v2h-2V5h2m-4 0v2H7V5h2Z"></path></svg>
                  </label>
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
