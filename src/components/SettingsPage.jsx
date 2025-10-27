import './SettingsPage.css'; // We'll create this file later
import ViewHeader from './ViewHeader.jsx';

function SettingsPage({ onBack }) {
  return (
    <div className="settings-page-container">
        <button onClick={onBack} className="back-button">
            &larr; Back to Territories
        </button>

      <ViewHeader title="Settings & Data Management" />
      
      <div className="settings-section">
        <h3>Export Data</h3>
        <p>Save a backup of all your data to a file on your device.</p>
        <button className="primary-action-btn">
          Export Full Backup
        </button>
      </div>
      <div className="settings-section">
        <h3>Import Data</h3>
        <p>Restore data from a backup file. This will replace existing data.</p>
        <button className="secondary-action-btn">
          Import from File
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;