import { useState, useEffect } from 'react'; // We now need useEffect here
import './App.css';
import { getAllFromStore, addToStore, updateInStore, deleteFromStore, getByIndex, getFromStore } from './database.js';
import StreetDetail from './components/StreetDetail.jsx';
import TerritoryList from './components/TerritoryList.jsx';
import StreetList from './components/StreetList.jsx';
import HouseList from './components/HouseList.jsx';
import AddTerritoryModal from './components/AddTerritoryModal.jsx';
import AddStreetModal from './components/AddStreetModal.jsx';
import AddHouseModal from './components/AddHouseModal.jsx';
import AddVisitModal from './components/AddVisitModal.jsx';
import HouseDetail from './components/HouseDetail.jsx';
import TerritoryDetail from './components/TerritoryDetail.jsx';

function App() {
  // --- STATE ---
  const [territories, setTerritories] = useState([]); // Master list of territories now lives here
  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);
  const [selectedStreetId, setSelectedStreetId] = useState(null); // We still need this for now
  const [isAddTerritoryModalOpen, setIsAddTerritoryModalOpen] = useState(false);
  const [isAddStreetModalOpen, setIsAddStreetModalOpen] = useState(false);
  const [isAddHouseModalOpen, setIsAddHouseModalOpen] = useState(false);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [houseListKey, setHouseListKey] = useState(0);
  const [visitListKey, setVisitListKey] = useState(0);
  const [streetListKey, setStreetListKey] = useState(0);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const handleUpdateTerritory = async (updatedTerritoryData) => {
    await updateInStore('territories', updatedTerritoryData);
    setSelectedTerritory(null); // Return to the territory list
    await fetchTerritories(); // Re-fetch all territories to show the change
  };
  

  const handleDeleteTerritory = async (territoryId) => {
    // This is a full cascading delete. We must delete all children first.
    const streetsToDelete = await getByIndex('streets', 'territoryId', territoryId);
    for (const street of streetsToDelete) {
      const housesToDelete = await getByIndex('houses', 'streetId', street.id);
      for (const house of housesToDelete) {
        // Later we'll also delete visits/people here
        await deleteFromStore('houses', house.id);
      }
      await deleteFromStore('streets', street.id);
    }
    await deleteFromStore('territories', territoryId); // Finally, delete the territory

    setSelectedTerritory(null);
    await fetchTerritories();
  };

  const handleBackToTerritoryList = () => {
    setSelectedTerritory(null);
  };


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
  const handleEditTerritory = async (territoryId) => {
    const territoryObject = await getFromStore('territories', territoryId);
    if (territoryObject) {
      setSelectedTerritory(territoryObject);
    } else {
      console.error("Could not find territory to edit with ID:", territoryId);
    }
  };

  const handleUpdateStreet = async (updatedStreetData) => {
    await updateInStore('streets', updatedStreetData);
    setSelectedStreet(null); // Go back to the list
    setStreetListKey(prevKey => prevKey + 1); // Refresh the list
  };

  const handleDeleteStreet = async (streetId) => {
    // This is a "cascading" delete. We must delete the children before the parent.
    const housesToDelete = await getByIndex('houses', 'streetId', streetId);
    for (const house of housesToDelete) {
      // In the future, we would also delete visits/people associated with each house here.
      await deleteFromStore('houses', house.id);
    }
    await deleteFromStore('streets', streetId); // Now delete the street itself
    setSelectedStreet(null);
    setStreetListKey(prevKey => prevKey + 1);
  };

  const handleBackToStreetList = () => {
    setSelectedStreet(null);
  };

  const handleSaveTerritory = async (newTerritory) => {
    await addToStore('territories', newTerritory); // Save to the database
    await fetchTerritories(); // Re-fetch the list to include the new one
    setIsAddTerritoryModalOpen(false); // Close the modal
  };

  const handleEditStreet = async (streetId) => {
    const streetObject = await getFromStore('streets', streetId);
    if (streetObject) {
      setSelectedStreet(streetObject);
    } else {
      console.error("Could not find street to edit with ID:", streetId);
    }
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

  const handleSaveHouse = async (houseData) => {
    // 1. Combine the house data from the modal with the currently selected street ID
    const newHouse = {
      ...houseData,
      streetId: selectedStreetId,
    };

    // 2. Save the complete house object to the database
    await addToStore('houses', newHouse);

    // 3. Increment the key to force the HouseList component to re-render
    setHouseListKey(prevKey => prevKey + 1);

    // 4. Close the modal
    setIsAddHouseModalOpen(false);
  };

  const handleOpenAddHouseModal = () => setIsAddHouseModalOpen(true);
  const handleCloseHouseModal = () => setIsAddHouseModalOpen(false);

  const handleOpenVisitModal = () => setIsAddVisitModalOpen(true);
  const handleCloseVisitModal = () => setIsAddVisitModalOpen(false);

  const handleStreetSelect = (streetId) => setSelectedStreetId(streetId);
  
  const handleHouseSelect = (houseObject) => {
    console.log('House selected:', houseObject); // For testing!
    setSelectedHouse(houseObject);
  };

  const handleUpdateHouse = async (updatedHouseData) => {
    // 1. Save the updated object to the database
    await updateInStore('houses', updatedHouseData);
  
    // 2. Clear the selected house to return to the list view
    setSelectedHouse(null);
  
    // 3. Increment the key to force the HouseList to re-fetch and show the new data
    setHouseListKey(prevKey => prevKey + 1);
  };

  const handleDeleteHouse = async (houseId) => {
    // 1. Delete the item from the database using its ID
    await deleteFromStore('houses', houseId);

    // 2. Clear the selected house to return to the list view
    setSelectedHouse(null);

    // 3. Increment the key to force the HouseList to re-fetch and show the updated list
    setHouseListKey(prevKey => prevKey + 1);
  };

  const handleGoBack = () => {
    setSelectedStreet(null);
    if (selectedStreetId) setSelectedStreetId(null);
    else if (selectedTerritoryId) setSelectedTerritoryId(null);
  };

  const handleOpenAddTerritoryModal = () => setIsAddTerritoryModalOpen(true);
  const handleCloseTerritoryModal = () => setIsAddTerritoryModalOpen(false);

  const handleOpenAddStreetModal = () => setIsAddStreetModalOpen(true);
  const handleCloseStreetModal = () => setIsAddStreetModalOpen(false);

  const handleSaveVisit = async (visitData) => {
    // 1. Ensure a house is actually selected
    if (!selectedHouse) {
      console.error("Cannot save visit: no house is selected.");
      return;
    }

    // 2. Combine the visit data from the modal with the selected house's ID
    const newVisit = {
      ...visitData,
      houseId: selectedHouse.id,
    };

    // 3. Save the complete visit object to the database
    await addToStore('visits', newVisit);

    // Refresh the visit list by updating the key
    setVisitListKey(prevKey => prevKey + 1);

    // 4. Close the modal
    setIsAddVisitModalOpen(false);
  };


  // --- RENDER LOGIC ---
  let currentView;
  if (selectedHouse) {
    currentView = (
      <HouseDetail 
        key={visitListKey}
        house={selectedHouse} 
        onBack={() => setSelectedHouse(null)}
        onSave={handleUpdateHouse}
        onDelete={handleDeleteHouse}
        onAddVisit={handleOpenVisitModal}
      />
    );
  } else if (selectedStreet) {
  currentView = (
    <StreetDetail
      street={selectedStreet}
      onBack={handleBackToStreetList}
      onSave={handleUpdateStreet}
      onDelete={handleDeleteStreet}
    />
  );

  } else if (selectedTerritory) {
    currentView = (
      <TerritoryDetail
        territory={selectedTerritory}
        onBack={handleBackToTerritoryList}
        onSave={handleUpdateTerritory}
        onDelete={handleDeleteTerritory}
      />
    );

  } else if (selectedStreetId) {
    currentView = <HouseList 
      streetId={selectedStreetId} 
      onBack={handleGoBack} 
      onAddHouse={handleOpenAddHouseModal}
      onHouseSelect={handleHouseSelect}
      onEditStreet={handleEditStreet}
      key={houseListKey} 
    />;

  } else if (selectedTerritoryId) {
    currentView = <StreetList 
      territoryId={selectedTerritoryId} 
      onStreetSelect={handleStreetSelect} 
      onBack={handleGoBack} 
      onAddStreet={handleOpenAddStreetModal} 
      onEditTerritory={handleEditTerritory}
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
    {isAddStreetModalOpen && (
  <AddStreetModal
    onSave={handleSaveStreet}
    onClose={handleCloseStreetModal}
    />
  )}

  {/* Add this new block here */}
  {isAddHouseModalOpen && (
    <AddHouseModal
      onSave={handleSaveHouse}
      onClose={handleCloseHouseModal}
    />
  )}
  {isAddVisitModalOpen && (
    <AddVisitModal
      onSave={handleSaveVisit}
      onClose={handleCloseVisitModal}
    />
  )}
    </>
  );
}

export default App;