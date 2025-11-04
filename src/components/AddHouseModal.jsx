// src/components/AddHouseModal.jsx

import { useState, useRef, useEffect } from 'react';
import './AddTerritoryModal.css'; // We can reuse the same CSS for consistency!
import './HouseDetail.css'; // Import for toggle button styles
import Icon from './Icon.jsx';

function AddHouseModal({ onSave, onClose }) {
  const [address, setAddress] = useState('');
  const [isNotInterested, setIsNotInterested] = useState(false);
  const [hasMailbox, setHasMailbox] = useState(false);
  const [hasGate, setHasGate] = useState(false);
  const [noTrespassing, setNoTrespassing] = useState(false);
  const inputRef = useRef(null);

  // Reset attributes when modal closes
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts (modal closes)
      setAddress('');
      setIsNotInterested(false);
      setHasMailbox(false);
      setHasGate(false);
      setNoTrespassing(false);
    };
  }, []);

  const handleSave = (closeModal) => {
    if (!address.trim()) {
      alert('Please enter an address or house number.');
      return;
    }

    // This is the new house object.
    // The streetId will be added in App.jsx.
    const newHouse = {
      address: address,
      isNotInterested: isNotInterested,
      isCurrentlyNH: true, // Always default to "Not at Home" for new houses
      hasGate: hasGate,
      hasMailbox: hasMailbox,
      noTrespassing: noTrespassing,
      notes: "" // Start with empty notes
    };

    // Call the function passed down from the parent with closeModal flag
    onSave(newHouse, closeModal);

    if (!closeModal) {
      // Save & New: clear only the address, keep attribute toggles
      setAddress('');
      // Focus back on the input field for quick data entry
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Add New House</h3>

        <label htmlFor="house-address">Address / House Number</label>
        <input
          ref={inputRef}
          type="text"
          id="house-address"
          placeholder="e.g., 123, 45B, Apt 6"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoFocus // Automatically focus the input field
        />

        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
            House Attributes
          </label>
          <div className="details-grid">
            <label className="detail-toggle-button">
              <input
                type="checkbox"
                checked={true}
                disabled
              />
              <span>NH</span>
              <Icon name="notAtHome" className="detail-icon icon-nh" />
            </label>

            <label className="detail-toggle-button">
              <input
                type="checkbox"
                checked={isNotInterested}
                onChange={(e) => setIsNotInterested(e.target.checked)}
              />
              <span>NI</span>
              <Icon name="notInterested" className="detail-icon icon-ni" />
            </label>

            <label className="detail-toggle-button">
              <input
                type="checkbox"
                checked={hasMailbox}
                onChange={(e) => setHasMailbox(e.target.checked)}
              />
              <span>Mbox</span>
              <Icon name="mailbox" className="detail-icon icon-mailbox" />
            </label>

            <label className="detail-toggle-button">
              <input
                type="checkbox"
                checked={noTrespassing}
                onChange={(e) => setNoTrespassing(e.target.checked)}
              />
              <span>NT</span>
              <Icon name="noTrespassing" className="detail-icon icon-no-trespassing" />
            </label>

            <label className="detail-toggle-button">
              <input
                type="checkbox"
                checked={hasGate}
                onChange={(e) => setHasGate(e.target.checked)}
              />
              <span>Gate</span>
              <Icon name="gate" className="detail-icon icon-gate" />
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => handleSave(false)}>Save & New</button>
          <button className="btn-primary" onClick={() => handleSave(true)}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}

export default AddHouseModal;