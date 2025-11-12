import React from 'react';
import './PersonCard.css';

function PersonCard({ person, onSelect, onAssociate, onViewStudy }) {
  const { name, territory, street, house, lastVisit, study } = person;

  const handleCardClick = () => {
    onSelect(person);
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
          <button className="secondary-action-btn" onClick={(e) => { e.stopPropagation(); onAssociate(person); }}>
            Associate with a House
          </button>
        </div>
      )}
      {lastVisit && <p><strong>Last Visit:</strong> {new Date(lastVisit.date).toLocaleDateString()}</p>}
      {study && (
        <div className="study-details">
          <button className="secondary-action-btn" onClick={(e) => { e.stopPropagation(); onViewStudy(person); }}>
            View Study
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonCard;
