import { useState } from 'react'; // Make sure to import useState
import './App.css';
import TerritoryList from './components/TerritoryList.jsx';
import StreetList from './components/StreetList.jsx'; // Import our new component
import { clearAllStores } from './database.js';

function App() {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);

  // 1. Create a function to handle going back
  const handleGoBack = () => {
    setSelectedTerritoryId(null);
  };

  return (
    <>
      <h1>Ministry Masorite v2</h1>
      {selectedTerritoryId === null ? (
        <TerritoryList onTerritorySelect={setSelectedTerritoryId} />
      ) : (
        // 2. Pass that new function down as a prop
        <StreetList 
          territoryId={selectedTerritoryId} 
          onBack={handleGoBack} 
        />
      )}
    </>
  );
}


export default App;