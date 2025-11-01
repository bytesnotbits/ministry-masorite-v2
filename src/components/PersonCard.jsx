import React from 'react';
import './PersonCard.css';

function PersonCard({ person, onSelect, onAssociate }) {
  const { name, territory, street, house, lastVisit, study } = person;

  const handleCardClick = () => {
    if (house) {
      onSelect(person);
    }
  };

  return (
    <div className={`person-card ${house ? '' : 'unassociated'}`} onClick={handleCardClick}>
      <h3>{name}</h3>
      {territory && street && house ? (
        <>
          <p><strong>Territory:</strong> {territory.number}</p>
          <p><strong>Street:</strong> {street.name}</p>
          <p><strong>House:</strong> {house.address}</p>
        </>
      ) : (
        <div className="unassociated-actions">
          <p><em>Not associated with a house.</em></p>
          <button onClick={(e) => { e.stopPropagation(); onAssociate(person); }}>
            Associate with a House
          </button>
        </div>
      )}
      {lastVisit && <p><strong>Last Visit:</strong> {new Date(lastVisit.date).toLocaleDateString()}</p>}
      {study && (
        <div className="study-details">
          <h4>Study Info</h4>
          <p><strong>Publication:</strong> {study.publication}</p>
          <p><strong>Lesson:</strong> {study.lesson}</p>
        </div>
      )}
    </div>
  );
}

export default PersonCard;
