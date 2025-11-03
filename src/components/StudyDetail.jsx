import { useState, useEffect } from 'react';
import './StudyDetail.css';
import { getByIndex } from '../database.js';
import VisitList from './VisitList.jsx';

function StudyDetail({ study, onBack, onDeleteVisit, onEditVisit, onAddVisit, studyVisitListKey, onEditStudy }) {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    const fetchVisits = async () => {
      if (study?.person?.id) {
        const visitData = await getByIndex('visits', 'personId', study.person.id);
        // Sort by date and time (most recent first)
        visitData.sort((a, b) => {
          const dateTimeA = `${a.date} ${a.time || '00:00'}`;
          const dateTimeB = `${b.date} ${b.time || '00:00'}`;
          return new Date(dateTimeB) - new Date(dateTimeA);
        });
        setVisits(visitData);
      }
    };

    fetchVisits();
  }, [study?.person?.id, studyVisitListKey]);

  console.log('onAddVisit in StudyDetail:', onAddVisit);

  return (
    <div className="study-detail-container">
      <div className="study-header">
        <div className="header-actions">
          <button className="primary-action-btn" onClick={() => onAddVisit(study.person)}>+ Add Visit</button>
          <button className="secondary-action-btn" onClick={() => onEditStudy(study)}>Edit Study</button>
        </div>
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