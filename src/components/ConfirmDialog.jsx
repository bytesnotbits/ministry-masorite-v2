// src/components/ConfirmDialog.jsx

import './AddTerritoryModal.css'; // Reuse existing modal styles

function ConfirmDialog({ message, onYes, onNo, yesText = "Yes", noText = "No" }) {
  return (
    <div className="modal-backdrop" onClick={onNo}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm</h3>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onNo}>
            {noText}
          </button>
          <button className="btn-primary" onClick={onYes}>
            {yesText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
