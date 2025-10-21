// src/components/VisitList.jsx

import './VisitList.css'; // We will create this file next

function VisitList({ visits, onDelete }) {
  return (
    <div className="visit-list-container">
      <h3>Visit History</h3>
      
      {visits && visits.length > 0 ? (
        <ul className="visit-list">
          {visits.map(visit => (
            <li key={visit.id} className="visit-item">
              <div className="visit-header"> {/* New wrapper div */}
                <div className="visit-date">
                  {new Date(visit.date).toLocaleDateString()}
                </div>
                <button 
                className="delete-visit-btn"
                onClick={() => onDelete(visit.id)} // <-- ADD THIS onClick HANDLER
                >
                    &times;
                </button>
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