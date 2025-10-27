import { useRef } from 'react';
import './SettingsPage.css';
import ViewHeader from './ViewHeader.jsx';

// We now accept onImport as a prop
function SettingsPage({ onBack, onExport, onImport, onClearAllData }) {
  // 1. Create the ref for our hidden file input
  const fileInputRef = useRef(null);

  // 2. This function is called when the VISIBLE button is clicked
  const handleImportClick = () => {
    // This programmatically clicks the hidden file input
    fileInputRef.current.click();
  };

  // 3. This function is called by the HIDDEN input when a file is chosen
  const handleFileChange = (event) => {
    // We pass the entire event up to the handler in App.jsx
    onImport(event);
  };

  return (
    <div className="settings-page-container">
      <button onClick={onBack} className="back-button">
        &larr; Back to Territories
      </button>

      <ViewHeader title="Settings & Data Management" />

      <div className="settings-section">
        <h3>Export Data</h3>
        <p>Save a backup of all your data to a file on your device.</p>
        <button className="primary-action-btn" onClick={onExport}>
          Export Full Backup
        </button>
      </div>
      
      <div className="settings-section">
        <h3>Import Data</h3>
        <p>Restore data from a backup file. This will replace existing data.</p>
        
        {/* The visible button triggers our click handler */}
        <button className="secondary-action-btn" onClick={handleImportClick}>
          Import from File
        </button>

        {/* The actual file input is hidden from the user */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // This is what hides it
          accept=".json" // Only allow .json files to be selected
        />
      </div>

      {/* --- START: DANGER ZONE SECTION --- */}
      {/* This is the correct placement, right after the Import section's closing div */}
      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>
          This will permanently delete all territories, streets, houses, and visits from your device. This cannot be undone.
        </p>
        <button className="danger-action-btn" onClick={onClearAllData}>
          Clear All Data
        </button>
      </div>
      {/* --- END: DANGER ZONE SECTION --- */}

    </div>
  );
}

export default SettingsPage;