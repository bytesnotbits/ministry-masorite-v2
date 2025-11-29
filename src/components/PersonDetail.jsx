import { useState, useEffect } from 'react';
import ViewHeader from './ViewHeader.jsx';
import VisitList from './VisitList.jsx';

function PersonDetail({ person, onBack, onAddVisit, onAssociate, onViewStudy, onDeleteVisit, onEditVisit, visits, studies }) {
  const personVisits = visits ? visits.filter(v => v.personId === person?.id) : [];
  const study = studies ? studies.find(s => s.personId === person?.id) : null;

  if (!person) {
    return null;
  }

  return (
    <div className="person-detail-container">
      <button onClick={onBack} className="back-button">
        &larr; Back to Studies
      </button>

      <ViewHeader title={person.name} />

      {study && (
        <div className="study-info-section">
          <h3>Study Details</h3>
          <p><strong>Publication:</strong> {study.publication}</p>
          <p><strong>Lesson:</strong> {study.lesson}</p>
          <button onClick={() => onViewStudy(person)}>View Study</button>
        </div>
      )}

      <div className="person-actions">
        <button onClick={() => onAssociate(person)}>Associate with House</button>
      </div>

      <div className="visit-history-section">
        <h3>Visit History</h3>
        <VisitList visits={personVisits} onAddVisit={() => onAddVisit(person)} onDelete={onDeleteVisit} onEdit={onEditVisit} people={[person]} />
      </div>
    </div>
  );
}

export default PersonDetail;
