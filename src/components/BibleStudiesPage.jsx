// src/components/BibleStudiesPage.jsx

import ViewHeader from './ViewHeader.jsx';

function BibleStudiesPage({ onBack }) {
  return (
    <div className="bible-studies-page-container">
      <button onClick={onBack} className="back-button">
        &larr; Back to Territories
      </button>

      <ViewHeader title="Return Visits & Bible Studies" />

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p>This page will list all Return Visits and Bible Studies.</p>
        <p><em>(Content coming soon!)</em></p>
      </div>
    </div>
  );
}

export default BibleStudiesPage;