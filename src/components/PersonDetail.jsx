import { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import ViewHeader from './ViewHeader.jsx';
import VisitList from './VisitList.jsx';

function PersonDetail({ person, onBack, onAddVisit, onAssociate, onViewStudy, onDeleteVisit, onEditVisit }) {
  const [visits, setVisits] = useState([]);
  const [study, setStudy] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (person) {
        const personVisits = await getByIndex('visits', 'personId', person.id);
        setVisits(personVisits);

        const studies = await getByIndex('studies', 'personId', person.id);
        if (studies.length > 0) {
          setStudy(studies[0]);
        }
      }
    }
    fetchData();
  }, [person]);

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
        <VisitList visits={visits} onAddVisit={() => onAddVisit(person)} onDelete={onDeleteVisit} onEdit={onEditVisit} people={[person]} />
      </div>
    </div>
  );
}

export default PersonDetail;
