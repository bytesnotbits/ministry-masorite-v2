import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initDB } from './database.js'; // Import our initDB function

// Call initDB and wait for it to complete before rendering the app
initDB().then(() => {
  console.log("Database initialized successfully.");
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}).catch(error => {
  console.error("Failed to initialize database:", error);
  // You could render an error message to the user here
  document.getElementById('root').innerHTML = '<h2>Error: Could not initialize database.</h2>';
});