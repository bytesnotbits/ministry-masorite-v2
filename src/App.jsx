import { useState, useEffect } from 'react'; // We now need useEffect here
import './App.css';
import { getAllFromStore, addToStore } from './database.js'; // Import addToStore
import TerritoryList from './components/TerritoryList.jsx';
import StreetList from './components/StreetList.jsx';
import HouseList from './components/HouseList.jsx';
import AddTerritoryModal from './components/AddTerritoryModal.jsx';

function App() {
  // --- STATE ---
  const [territories, setTerritories] = useState([]); // Master list of territories now lives here
  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);
  const [selectedStreetId, setSelectedStreetId] = useState(null);
  const [isAddTerritoryModalOpen, setIsAddTerritoryModalOpen] = useState(false);

  // --- DATA FETCHING ---
  // This useEffect runs once to load the initial territory list
  useEffect(() => {
    fetchTerritories();
  }, []);

  const fetchTerritories = async () => {
    const data = await getAllFromStore('territories');
    setTerritories(data);
  };

  // --- HANDLERS ---
  const handleSaveTerritory = async (newTerritory) => {
    await addToStore('territories', newTerritory); // Save to the database
    await fetchTerritories(); // Re-fetch the list to include the new one
    setIsAddTerritoryModalOpen(false); // Close the modal
  };

  const handleStreetSelect = (streetId) => setSelectedStreetId(streetId);
  const handleGoBack = () => {
    if (selectedStreetId) setSelectedStreetId(null);
    else if (selectedTerritoryId) setSelectedTerritoryId(null);
  };
  const handleOpenAddTerritoryModal = () => setIsAddTerritoryModalOpen(true);
  const handleCloseModal = () => setIsAddTerritoryModalOpen(false);

  // --- RENDER LOGIC ---
  let currentView;
  if (selectedStreetId) {
    currentView = <HouseList streetId={selectedStreetId} onBack={handleGoBack} />;
  } else if (selectedTerritoryId) {
    currentView = <StreetList territoryId={selectedTerritoryId} onStreetSelect={handleStreetSelect} onBack={handleGoBack} />;
  } else {
    currentView = (
      <TerritoryList
        territories={territories} // Pass the list down as a prop
        onTerritorySelect={setSelectedTerritoryId}
        onAddTerritory={handleOpenAddTerritoryModal}
      />
    );
  }

  return (
    <>
      <h1>Ministry Masorite v2</h1>
      {currentView}
      {isAddTerritoryModalOpen && (
        <AddTerritoryModal
          onSave={handleSaveTerritory}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default App;