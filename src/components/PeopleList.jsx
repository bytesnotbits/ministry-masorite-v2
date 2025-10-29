import './PeopleList.css';

function PeopleList({ people, onEdit, onDelete, onStartStudy, onViewStudy }) {
  return (
    <div className="people-list-container">
      <h3>People</h3>
      
      {people && people.length > 0 ? (
        <ul className="people-list">
          {people.map(person => (
            <li key={person.id} className="person-item">
                <div className="person-details">
                <div className="person-name">
                    {person.name}
                </div>
                {/* Conditionally render notes only if they exist */}
                {person.notes && (
                    <p className="person-notes">
                    {person.notes}
                    </p>
                )}
                </div>
              <div className="person-item-actions">
                {person.hasStudy ? (
                  <button 
                    className="view-study-btn" // A new class for styling
                    onClick={() => onViewStudy(person)} // A new handler we'll wire up later
                  >
                    View Study
                  </button>
                ) : (
                  <button 
                    className="start-study-btn"
                    onClick={() => onStartStudy(person)}
                  >
                    Start Study
                  </button>
                )}                <button 
                  className="edit-person-btn"
                  onClick={() => onEdit(person)}
                >
                  Edit
                </button>
                <button 
                  className="delete-person-btn"
                  onClick={() => onDelete(person.id)}
                >
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No people recorded for this house yet.</p>
      )}
    </div>
  );
}

export default PeopleList;