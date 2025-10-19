import { useState, useEffect } from 'react'; // We now need useEffect here
import './App.css';
import { getAllFromStore, addToStore } from './database.js'; // Import addToStore
import TerritoryList from './components/TerritoryList.jsx';
import StreetList from './components/StreetList.jsx';
import HouseList from './components/HouseList.jsx';
import AddTerritoryModal from './components/AddTerritoryModal.jsx';
import AddStreetModal from './components/AddStreetModal.jsx';


function App() {
  // --- STATE ---
  const [territories, setTerritories] = useState([]); // Master list of territories now lives here
  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);
  const [selectedStreetId, setSelectedStreetId] = useState(null);
  const [isAddTerritoryModalOpen, setIsAddTerritoryModalOpen] = useState(false);
  const [isAddStreetModalOpen, setIsAddStreetModalOpen] = useState(false);
  const [streetListKey, setStreetListKey] = useState(0);

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

  const handleSaveStreet = async (streetData) => {
    // 1. Combine the street name from the modal with the currently selected territory ID
    const newStreet = {
      ...streetData, // This copies the { name: '...' } object from the modal
      territoryId: selectedTerritoryId, // This adds the ID of the parent territory
    };

    // 2. Save the complete street object to the database
    await addToStore('streets', newStreet);

    // 3. Re-fetch the territories to update the UI (we'll improve this later)
    // await fetchTerritories(); // This is a temporary measure
    setStreetListKey(prevKey => prevKey + 1);

    // 4. Close the modal
    setIsAddStreetModalOpen(false);
  };

  const handleStreetSelect = (streetId) => setSelectedStreetId(streetId);
  const handleGoBack = () => {
    if (selectedStreetId) setSelectedStreetId(null);
    else if (selectedTerritoryId) setSelectedTerritoryId(null);
  };
  const handleOpenAddTerritoryModal = () => setIsAddTerritoryModalOpen(true);
  const handleCloseTerritoryModal = () => setIsAddTerritoryModalOpen(false);

  const handleOpenAddStreetModal = () => setIsAddStreetModalOpen(true);
  const handleCloseStreetModal = () => setIsAddStreetModalOpen(false);

  // --- RENDER LOGIC ---
  let currentView;
  if (selectedStreetId) {
    currentView = <HouseList streetId={selectedStreetId} onBack={handleGoBack} />;
  } else if (selectedTerritoryId) {
    currentView = <StreetList 
      territoryId={selectedTerritoryId} 
      onStreetSelect={handleStreetSelect} 
      onBack={handleGoBack} 
      onAddStreet={handleOpenAddStreetModal} 
      key={streetListKey}
      />;
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
          onClose={handleCloseTerritoryModal}
        />
      )}
      {isAddStreetModalOpen && (
      <AddStreetModal
        onSave={handleSaveStreet}
        onClose={handleCloseStreetModal}
      />
    )}
    </>
  );
}

export default App;