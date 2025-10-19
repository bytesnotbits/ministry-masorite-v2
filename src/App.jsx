import { useState } from 'react';
import './App.css';
import TerritoryList from './components/TerritoryList.jsx';
import StreetList from './components/StreetList.jsx';
import HouseList from './components/HouseList.jsx';

function App() {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);
  const [selectedStreetId, setSelectedStreetId] = useState(null);

  // New handler for selecting a street
  const handleStreetSelect = (streetId) => {
    setSelectedStreetId(streetId);
  };

  const handleGoBack = () => {
    // This logic is now a bit smarter
    if (selectedStreetId !== null) {
      setSelectedStreetId(null); // Go from HouseList back to StreetList
    } else if (selectedTerritoryId !== null) {
      setSelectedTerritoryId(null); // Go from StreetList back to TerritoryList
    }
  };

  let currentView;
  if (selectedStreetId !== null) {
    // Pass the streetId and the back handler to HouseList
    currentView = (
      <HouseList
        streetId={selectedStreetId}
        onBack={handleGoBack}
      />
    );
  } else if (selectedTerritoryId !== null) {
    // Pass the new street select handler to StreetList
    currentView = (
      <StreetList
        territoryId={selectedTerritoryId}
        onStreetSelect={handleStreetSelect}
        onBack={handleGoBack}
      />
    );
  } else {
    currentView = <TerritoryList onTerritorySelect={setSelectedTerritoryId} />;
  }

  return (
    <>
      <h1>Ministry Masorite v2</h1>
      {currentView}
    </>
  );
}

export default App;