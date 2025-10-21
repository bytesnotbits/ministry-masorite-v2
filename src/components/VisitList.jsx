// src/components/VisitList.jsx

import './VisitList.css'; // We will create this file next

function VisitList({ visits, onDelete, onEdit }) {
  return (
    <div className="visit-list-container">
      <h3>Visit History</h3>
      
      {visits && visits.length > 0 ? (
        <ul className="visit-list">
          {visits.map(visit => (
            <li key={visit.id} className="visit-item">
              <div className="visit-header">
                <div className="visit-date">
                    {(() => {
                        const [year, month, day] = visit.date.substring(0, 10).split('-');
                        return `${month}/${day}/${year}`;
                    })()}
                </div>
                <div className="visit-item-actions">
                  <button 
                    className="edit-visit-btn"
                    onClick={() => onEdit(visit)} // <-- ADD THIS onClick HANDLER
                    >
                    Edit
                    </button>
                  <button 
                    className="delete-visit-btn"
                    onClick={() => onDelete(visit.id)}
                  >
                    &times;
                  </button>
                </div>
              </div>
              <p className="visit-notes">
                {visit.notes || <em>No notes for this visit.</em>}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No visits recorded yet.</p>
      )}

    </div>
  );
}

export default VisitList;