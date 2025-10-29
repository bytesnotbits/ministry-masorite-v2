import { useState, useEffect } from 'react';
import './StudyDetail.css';
import { getByIndex } from '../database.js';
import VisitList from './VisitList.jsx';

function StudyDetail({ study, onBack, onDeleteVisit, onEditVisit }) {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    const fetchVisits = async () => {
      if (study?.person?.id) {
        const visitData = await getByIndex('visits', 'personId', study.person.id);
        visitData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setVisits(visitData);
      }
    };

    fetchVisits();
  }, [study?.person?.id]);

  return (
    <div className="study-detail-container">
      <div className="study-header">
        <h2>Study with {study.person.name}</h2>
        <button onClick={onBack}>Back</button>
      </div>

      <div className="study-info">
        <p><strong>Started:</strong> {new Date(study.startDate).toLocaleDateString()}</p>
        <p><strong>Publication:</strong> {study.publication}</p>
        <p><strong>Lesson:</strong> {study.lesson}</p>
      </div>

      <VisitList 
        visits={visits} 
        onDelete={onDeleteVisit} 
        onEdit={onEditVisit} 
        people={[study.person]}
      />
    </div>
  );
}

export default StudyDetail;