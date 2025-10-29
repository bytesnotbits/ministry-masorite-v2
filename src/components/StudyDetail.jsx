import './StudyDetail.css';

function StudyDetail({ study, onBack }) {
  return (
    <div className="study-detail-container">
      <h2>Study with {study.person.name}</h2>
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default StudyDetail;