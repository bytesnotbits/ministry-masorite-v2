import './PeopleList.css';

function PeopleList({ people, onEdit, onDelete }) {
  return (
    <div className="people-list-container">
      <h3>People</h3>
      
      {people && people.length > 0 ? (
        <ul className="people-list">
          {people.map(person => (
            <li key={person.id} className="person-item">
              <div className="person-name">
                {person.name}
              </div>
              <div className="person-item-actions">
                <button 
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