import { useState, useEffect } from 'react';
import './StudyDetail.css';
import VisitList from './VisitList.jsx';
import LongPressEditField from './LongPressEditField.jsx';
import ViewHeader from './ViewHeader.jsx';

function StudyDetail({ study, onBack, onDeleteVisit, onEditVisit, onAddVisit, studyVisitListKey, onUpdateStudy, visits: allVisits }) {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    if (study?.person?.id && allVisits) {
      const visitData = allVisits.filter(v => v.personId === study.person.id);
      visitData.sort((a, b) => {
        const dateTimeA = `${a.date} ${a.time || '00:00'}`;
        const dateTimeB = `${b.date} ${b.time || '00:00'}`;
        return new Date(dateTimeB) - new Date(dateTimeA);
      });
      setVisits(visitData);
    }
  }, [study?.person?.id, studyVisitListKey, allVisits]);

  const handleUpdate = (field, value) => {
    const updatedStudy = { ...study, [field]: value };
    onUpdateStudy(updatedStudy);
  };

  return (
    <div className="study-detail-container">
      <ViewHeader
        title={`Study with ${study.person.name}`}
        primaryAction={{
          label: '+ Add Visit',
          handler: () => onAddVisit(study.person),
        }}
      />

      <div className="study-info">
        <p><strong>Started:</strong> {new Date(study.startDate).toLocaleDateString()}</p>
        <LongPressEditField
          label="Publication"
          value={study.publication}
          onSave={(newValue) => handleUpdate('publication', newValue)}
          placeholder="Enter publication"
        />
        <LongPressEditField
          label="Lesson"
          value={study.lesson}
          onSave={(newValue) => handleUpdate('lesson', newValue)}
          placeholder="Enter lesson"
        />
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