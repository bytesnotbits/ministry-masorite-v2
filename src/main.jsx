import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initDB, getAllFromStore, clearAllStores } from './database.js';
import { executeMerge } from './database-api.js';

const BACKUP_FILE_NAME = 'ministry_scribe_full_backup 10-13-25 0935.json';

// We create a main function so we can use async/await
async function main() {
  try {
    // 1. Wait for the database to initialize
    await initDB();
    console.log("Database initialized successfully.");

    // 2. Check if the database has data
    const territories = await getAllFromStore('territories');
    if (territories.length === 0) {
      console.log("Database is empty. Attempting to load from backup file...");
      
      const response = await fetch(`/${BACKUP_FILE_NAME}`);
      if (!response.ok) {
        throw new Error(`Could not fetch backup file: ${response.statusText}`);
      }
      const backupData = await response.json();

      if (backupData.meta?.appName === 'MinistryScribe') {
        console.log("Backup file is valid. Importing data...");
        // 3. Wait for the entire import to finish
        await executeMerge(backupData.data);
        console.log("Data successfully imported from backup.");
      } else {
        console.warn("File is not a valid backup. Skipping import.");
      }
    } else {
      console.log("Database already has data. Skipping import.");
    }

    // 4. ONLY NOW, after all data logic is done, render the React app
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

  } catch (error) {
    console.error("Failed to initialize or import data:", error);
    document.getElementById('root').innerHTML = '<h2>Error: Could not initialize application.</h2>';
  }
}

// Run the main function to start the app
main();