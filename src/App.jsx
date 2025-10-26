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
import AddPersonModal from './components/AddPersonModal.jsx';
import HouseDetail from './components/HouseDetail.jsx';
import TerritoryDetail from './components/TerritoryDetail.jsx';
import Breadcrumbs from './components/Breadcrumbs.jsx';


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
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState(null);
  const [peopleListKey, setPeopleListKey] = useState(0);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [visitToEdit, setVisitToEdit] = useState(null);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedTerritoryDetails, setSelectedTerritoryDetails] = useState(null);
  const [selectedStreetDetails, setSelectedStreetDetails] = useState(null);
  const [peopleForSelectedHouse, setPeopleForSelectedHouse] = useState([]);
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


  // --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---
  // This useEffect runs once to load the initial territory list
  useEffect(() => {
    fetchTerritories();
  }, []);

  const fetchTerritories = async () => {
    const data = await getAllFromStore('territories');
    setTerritories(data);
  };

  // --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---
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
    
    console.log("handleEditStreet was called with ID:", streetId);
    
    const streetObject = await getFromStore('streets', streetId);
    
    console.log("Found street object:", streetObject);
    
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
  const handleCloseVisitModal = () => {
    setIsAddVisitModalOpen(false);
    setVisitToEdit(null); // Also reset the state on cancel/close
  };

  const handleClosePersonModal = () => {
    setIsAddPersonModalOpen(false);
    setPersonToEdit(null); // Always reset personToEdit when closing
  };

  const handleSavePerson = async (personData, personToEdit) => {
    // Check if we are editing or adding
    if (personToEdit) {
      // --- UPDATE (EDIT) LOGIC ---
      const updatedPerson = { 
        ...personToEdit, // The original person object
        ...personData    // The new data from the form (just the name for now)
      };
      await updateInStore('people', updatedPerson);
    } else {
      // --- ADD (CREATE) LOGIC ---
      if (!selectedHouse) {
        console.error("Cannot save person: no house is selected.");
        return; // Safety check
      }
      const newPerson = {
        ...personData,
        houseId: selectedHouse.id,
      };
      await addToStore('people', newPerson);
    }
    
    // --- This runs for BOTH adds and updates ---
    setPeopleListKey(prevKey => prevKey + 1); // Force the PeopleList to refresh
    handleClosePersonModal();                   // Close the modal
  };

  const handleStreetSelect = async (streetId) => {
    const street = await getFromStore('streets', streetId);
    setSelectedStreetDetails(street);
    setSelectedStreetId(streetId);
  };

  const handleHouseSelect = async (houseObject) => {
    setSelectedHouse(houseObject);
    if (houseObject) {
      const peopleData = await getByIndex('people', 'houseId', houseObject.id);
      setPeopleForSelectedHouse(peopleData);
    } else {
      // If we are deselecting a house, clear the list
      setPeopleForSelectedHouse([]);
    }
  };

  const handleUpdateHouse = async (updatedHouseData, stayOnPage = false) => {
      // 1. Save the updated object to the database
      await updateInStore('houses', updatedHouseData);
      
      // 2. Force the HouseList to update in the background for next time
      setHouseListKey(prevKey => prevKey + 1);

      if (stayOnPage) {
          // If we're staying, just refresh the data for the current view
          const refreshedHouse = await getFromStore('houses', updatedHouseData.id);
          setSelectedHouse(refreshedHouse);
      } else {
          // If we're not staying (default behavior), go back to the list
          setSelectedHouse(null);
      }
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

  const handleSaveVisit = async (visitData, visitToEdit) => {
    // Check if we are editing an existing visit or adding a new one
    if (visitToEdit) {
      // --- UPDATE LOGIC ---
      // Combine the original visit's ID and houseId with the new form data
      const updatedVisit = { 
        ...visitToEdit, // a.k.a the original visit
        ...visitData    // a.k.a the new date and notes from the form
      };
      await updateInStore('visits', updatedVisit);
    } else {
      // --- ADD (CREATE) LOGIC ---
      if (!selectedHouse) {
        console.error("Cannot save visit: no house is selected.");
        return;
      }
      const newVisit = {
        ...visitData,
        houseId: selectedHouse.id,
      };
      await addToStore('visits', newVisit);
    }
    
    // --- This runs for both adds and updates ---
    setVisitListKey(prevKey => prevKey + 1); // Force a refresh
    setIsAddVisitModalOpen(false); // Close the modal
    setVisitToEdit(null); // IMPORTANT: Reset the visitToEdit state
  };

    const handleAddPerson = () => {
      setIsAddPersonModalOpen(true);
    };

    const handleDeletePerson = async (personId) => {
      // Show a confirmation dialog to prevent accidental deletion
      if (window.confirm('Are you sure you want to permanently delete this person?')) {
        // 1. Delete the person from the database using their ID
        await deleteFromStore('people', personId);
        
        // 2. Increment the key to force the component to re-render
        setPeopleListKey(prevKey => prevKey + 1);
      }
    };

    const handleEditPerson = (personObject) => {
      setPersonToEdit(personObject); // 1. Store the person we want to edit
      setIsAddPersonModalOpen(true);    // 2. Open the modal
    };

    const handleTerritorySelect = async (territoryId) => {
      const territory = await getFromStore('territories', territoryId);
      setSelectedTerritoryDetails(territory);
      setSelectedTerritoryId(territoryId);
    };
  
  const handleDeleteVisit = async (visitId) => {
    // Show a confirmation dialog before deleting
    if (window.confirm('Are you sure you want to permanently delete this visit?')) {
      // 1. Delete the visit from the database using its ID
      await deleteFromStore('visits', visitId);

      // 2. Increment the key to force the component to re-fetch and show the updated list
      setVisitListKey(prevKey => prevKey + 1);
    }
  };

  const handleEditVisit = (visitObject) => {
    setVisitToEdit(visitObject);      // Store the visit we want to edit
    setIsAddVisitModalOpen(true); // Open the modal
  };



  // --- RENDER LOGIC ---   --- RENDER LOGIC ---   --- RENDER LOGIC ---   --- RENDER LOGIC ---   --- RENDER LOGIC ---
  let currentView;
  if (selectedHouse) {
      currentView = (
        <HouseDetail 
          key={peopleListKey}
          house={selectedHouse} 
          onSave={handleUpdateHouse}
          onDelete={handleDeleteHouse}
          onAddVisit={handleOpenVisitModal}
          onDeleteVisit={handleDeleteVisit}
          onEditVisit={handleEditVisit}
          onAddPerson={handleAddPerson}
          onDeletePerson={handleDeletePerson}
          onEditPerson={handleEditPerson}
          visitListKey={visitListKey}
        />
      );
  } else if (selectedStreet) {
  currentView = (
    <StreetDetail
      street={selectedStreet}
      onSave={handleUpdateStreet}
      onDelete={handleDeleteStreet}
    />
  );

  } else if (selectedTerritory) {
    currentView = (
      <TerritoryDetail
        territory={selectedTerritory}
        onSave={handleUpdateTerritory}
        onDelete={handleDeleteTerritory}
      />
    );

  } else if (selectedStreetId) {
      currentView = <HouseList 
        streetId={selectedStreetId} 
        onAddHouse={handleOpenAddHouseModal}
        onHouseSelect={handleHouseSelect}
        onEditStreet={handleEditStreet}
        key={houseListKey} 
      />;

  } else if (selectedTerritoryId) {
      currentView = <StreetList 
        territoryId={selectedTerritoryId} 
        onStreetSelect={handleStreetSelect} 
        onAddStreet={handleOpenAddStreetModal} 
        onEditTerritory={handleEditTerritory}
        /* We added `key={streetListKey}` a while back to force the street list to re-render when we added or 
        deleted a street. However, it looks like it might be interfering with the natural re-render cycle now 
        that we're fetching and setting the `territoryDetails` state. When the key changes, React tears down 
        the old component and creates a brand new one, which can sometimes cause state updates to get lost or 
        behave unpredictably.

        By removing it, we let React handle the updates more naturally. The component will still re-render 
        when you add/delete a street because the `onStreetSelect` and other handlers correctly update the 
        state in `App.jsx`, which triggers a re-render anyway. */
        // key={streetListKey}
        />;
  } else {
    currentView = (
      <TerritoryList
        territories={territories} // Pass the list down as a prop
        onTerritorySelect={handleTerritorySelect}
        onAddTerritory={handleOpenAddTerritoryModal}
      />
    );
  }

  // --- BREADCRUMB LOGIC ---
  let crumbs = [];

  // We only show breadcrumbs if we have navigated away from the home screen
  if (selectedTerritoryId) {
    // 1. The "Home" crumb
    crumbs.push({
      label: 'Territories',
      onClick: () => {
        setSelectedTerritoryId(null);
        setSelectedStreetId(null);
        setSelectedHouse(null);
        setSelectedTerritoryDetails(null);
        setSelectedStreetDetails(null);
      }
    });

    // 2. The "Territory" crumb (shows when you're on a street or house)
    if (selectedStreetDetails) {
      crumbs.push({
        label: `${selectedTerritoryDetails.number}`,
        onClick: () => {
          setSelectedStreetId(null);
          setSelectedHouse(null);
          setSelectedStreetDetails(null);
        }
      });
    }

    // 3. The "Street" crumb (shows only when you're on a house)
    if (selectedHouse) {
      crumbs.push({
        label: selectedStreetDetails.name,
        onClick: () => {
          setSelectedHouse(null);
        }
      });
    }
  }
  // --- END BREADCRUMB LOGIC ---

  console.log('App state before render:', { selectedStreet, selectedStreetId });

  return ( // --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---
    <>
      {!selectedTerritoryId && <h1>Ministry Masorite v2</h1>}
      <Breadcrumbs crumbs={crumbs} />
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
          visitToEdit={visitToEdit}
          people={peopleForSelectedHouse}
        />
      )}

      {isAddPersonModalOpen && (
        <AddPersonModal
          onSave={handleSavePerson}
          onClose={handleClosePersonModal}
          personToEdit={personToEdit}
        />
      )}
    </>
  );
}

export default App;