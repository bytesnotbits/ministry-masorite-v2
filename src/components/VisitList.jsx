// src/components/VisitList.jsx

import './VisitList.css'; // We will create this file next

function VisitList({ visits, onDelete, onEdit, people }) {
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
                        let dateStr = `${month}/${day}/${year}`;

                        // Add time if available
                        if (visit.time) {
                            const [hours, minutes] = visit.time.split(':');
                            const hour = parseInt(hours, 10);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                            dateStr += ` at ${displayHour}:${minutes} ${ampm}`;
                        }

                        return dateStr;
                    })()}
                </div>
                <div className="visit-item-actions">
                  <button 
                    className="edit-visit-btn"
                    onClick={() => onEdit(visit)}
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
              <div className="visit-person-notes-container">
                {visit.personId && (
                  <div className="visit-person-name">
                    👤 {people.find(p => p.id === visit.personId)?.name || 'Unknown Person'}
                  </div>
                )}
                <p className="visit-notes">
                  {visit.notes || <em>No notes for this visit.</em>}
                </p>
              </div>
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