import { useState, useEffect } from 'react'; // We now need useEffect here
import './App.css';
import { getAllFromStore, addToStore, updateInStore, deleteFromStore, getByIndex, getFromStore, clearAllStores } from './database.js';
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
import SettingsPage from './components/SettingsPage.jsx';
import { executeMerge, handleJsonExport, handleFileImport } from './database-api.js';
import BibleStudiesPage from './components/BibleStudiesPage.jsx';
import AddStudyModal from './components/AddStudyModal.jsx';



function App() {
  // --- STATE ---
  const [territories, setTerritories] = useState([]); // Master list of territories now lives here
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
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
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [isBibleStudiesVisible, setIsBibleStudiesVisible] = useState(false);
  const [isAddStudyModalOpen, setIsAddStudyModalOpen] = useState(false);
  const [personForStudy, setPersonForStudy] = useState(null);
  const handleCloseStudyModal = () => {
    setIsAddStudyModalOpen(false);
    setPersonForStudy(null);
  };
  const [studies, setStudies] = useState([]);



  // --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---
  // This useEffect runs once to load the initial territory list
  // EFFECT 1: This runs ONCE when the app loads to fetch the initial data.
  useEffect(() => {
    fetchTerritories();
    fetchStudies();
  }, []);

  // EFFECT 2: This runs whenever `isLoading` changes, to manage the delayed indicator.
  useEffect(() => {
    let timer;

    if (isLoading) {
      // If we are loading, start a timer that will show the indicator after 500ms.
      timer = setTimeout(() => {
        setShowLoadingIndicator(true);
      }, 500); // 500 milliseconds = half a second

    } else {
      // If loading is finished, immediately hide the indicator.
      setShowLoadingIndicator(false);
    }

    // Cleanup function: This is crucial to prevent bugs.
    // It runs before the effect runs again, or when the component unmounts.
    return () => {
      clearTimeout(timer); // It cancels the timer if loading finishes before 500ms.
    };
  }, [isLoading]); // The dependency array: this effect depends on `isLoading`.

/* This function fetches the list of territories and enriches each with its houses 
Finding all its child streets.
Then, for all of those streets, we find all their child houses.
Finally, we bundle all of those houses together into a single houses array and attach it directly to the territory object.
This gives our TerritoryList component all the data it will need to calculate the territory-wide stats.
*/  
const fetchTerritories = async () => {
    setIsLoading(true); // Explicitly set loading to true when we start.

    try {
      // 1. Get the base list of all territories
      const territoryData = await getAllFromStore('territories');

      // 2. Create a promise for each territory to go find all its houses
      const territoriesWithStatsPromises = territoryData.map(async (territory) => {
        // a. Find all streets in this territory
        const streetsForTerritory = await getByIndex('streets', 'territoryId', territory.id);
        
        // b. For each of those streets, create another promise to get its houses
        const housePromises = streetsForTerritory.map(street => 
          getByIndex('houses', 'streetId', street.id)
        );

        // c. Wait for all the house lookups for this territory to complete
        const housesByStreet = await Promise.all(housePromises);
        
        // d. Flatten the array of arrays into a single list of all houses
        const allHousesForTerritory = housesByStreet.flat();

        // e. Return a new object combining the original territory with its complete list of houses
        return { ...territory, houses: allHousesForTerritory };
      });

      // 3. Wait for all the territory promises to complete
      const enrichedTerritories = await Promise.all(territoriesWithStatsPromises);

      // 4. Set the final, enriched data into state
      setTerritories(enrichedTerritories);

    } catch (error) {
      console.error("Failed to fetch and process territories:", error);
      // In a real app, you might want to set an error state here
    } finally {
      // 5. THIS IS THE KEY: This will run after everything else is done.
      setIsLoading(false); 
    }
  };

  const fetchStudies = async () => {
    const studiesData = await getAllFromStore('studies');
    setStudies(studiesData);
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
      // 1. Get the people for the house (same as before)
      const peopleData = await getByIndex('people', 'houseId', houseObject.id);

      // 2. NEW: Check each person to see if they have a study
      const peopleWithStudyStatus = peopleData.map(person => {
        // The .some() method checks if any item in the 'studies' array
        // meets the condition. It's very efficient.
        const hasStudy = studies.some(study => study.personId === person.id);
        
        // Return a new person object with the 'hasStudy' property
        return { ...person, hasStudy: hasStudy };
      });

      // 3. Set the enhanced list of people into state
      setPeopleForSelectedHouse(peopleWithStudyStatus);

    } else {
      // If we are deselecting a house, clear the list (same as before)
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

  const handleStartStudy = (person) => {
    setPersonForStudy(person); // Store the person we're starting a study with
    setIsAddStudyModalOpen(true); // Open the modal
  };

  const handleViewStudy = (person) => {
    console.log('Viewing study for:', person);
  };


  const handleOpenSettings = () => setIsSettingsVisible(true);
    const handleCloseSettings = () => setIsSettingsVisible(false);

  const handleOpenBibleStudies = () => setIsBibleStudiesVisible(true);
    const handleCloseBibleStudies = () => setIsBibleStudiesVisible(false);
  
    const handleExportData = () => {
    handleJsonExport('full'); // We pass 'full' to tell it we want a complete backup
  };

  const handleImportData = (event) => {
    // This is the callback function. It will run AFTER the import is successful.
    const onImportComplete = () => {
      console.log("Import complete! Reloading app state...");
      // Reset all navigation state to go back to the home screen
      setSelectedTerritoryId(null);
      setSelectedStreetId(null);
      setSelectedHouse(null);
      setSelectedTerritory(null);
      setSelectedStreet(null);
      setIsSettingsVisible(false); // Close the settings page
      fetchTerritories(); // Re-fetch all data from the database
    };

    // Call the main import function from the API, passing it the file event and our callback
    handleFileImport(event, onImportComplete);
  };

  const handleClearAllData = async () => {
    if (window.confirm("ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete ALL data. This action cannot be undone.")) {
      try {
        // 1. Call the function to wipe the IndexedDB database
        await clearAllStores();

        // 2. Reset all state variables to their initial, empty values
        setTerritories([]);
        setSelectedTerritoryId(null);
        setSelectedStreetId(null);
        setSelectedHouse(null);
        setSelectedTerritory(null);
        setSelectedStreet(null);
        setIsSettingsVisible(false); // Go back to the main screen

        // 3. Notify the user
        alert("All data has been successfully cleared. The app will now be in its initial state.");

      } catch (error) {
        console.error("Failed to clear all data:", error);
        alert("An error occurred while trying to clear the data. Please check the console.");
      }
    }
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

  const handleSaveStudy = async (studyData) => {
    // 1. Save the new study to the database
    await addToStore('studies', studyData);
    
    // 2. Ensure the person is marked as an RV
    const person = await getFromStore('people', studyData.personId);
    if (person && !person.isRV) {
      person.isRV = true; // Directly modify the object we already have
      await updateInStore('people', person);
    }

    // 3. Re-fetch the studies to update the app's state
    await fetchStudies();

    // 4. THE FIX: Manually refresh the people list for the current house
    if (selectedHouse) {
      // We re-run the logic from handleHouseSelect right here
      const peopleData = await getByIndex('people', 'houseId', selectedHouse.id);
      const refreshedStudies = await getAllFromStore('studies'); // Get the absolute latest
      const peopleWithStudyStatus = peopleData.map(p => {
        const hasStudy = refreshedStudies.some(s => s.personId === p.id);
        return { ...p, hasStudy: hasStudy };
      });
      setPeopleForSelectedHouse(peopleWithStudyStatus);
    }
    
    // 5. Close the modal and notify the user
    handleCloseStudyModal();
    alert(`Study started successfully with ${person.name}!`);
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
  if (isBibleStudiesVisible) { // <-- TOP-LEVEL CHECK
    currentView = (
      <BibleStudiesPage 
        onBack={handleCloseBibleStudies} 
      />
    );
  } else if (isSettingsVisible) {
    currentView = (
      <SettingsPage 
      onBack={handleCloseSettings} 
      onExport={handleExportData} 
      onImport={handleImportData}
      onClearAllData={handleClearAllData}
    />
    );
  } else { // <-- WRAP EVERYTHING ELSE IN THIS ELSE BLOCK
    if (selectedHouse) {
        currentView = (
          <HouseDetail 
            people={peopleForSelectedHouse}
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
            onStartStudy={handleStartStudy}
            onViewStudy={handleViewStudy}
          />
        );
    } else if (selectedStreet) {
    currentView = (
      <StreetDetail
        street={selectedStreet}
        onSave={handleUpdateStreet}
        onDelete={handleDeleteStreet}
        onCancel={handleBackToStreetList}
      />
    );

    } else if (selectedTerritory) {
      currentView = (
        <TerritoryDetail
          territory={selectedTerritory}
          onSave={handleUpdateTerritory}
          onDelete={handleDeleteTerritory}
          onCancel={handleBackToTerritoryList}
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
          />;
    } else {
      currentView = (
        <TerritoryList
          territories={territories} 
          onTerritorySelect={handleTerritorySelect}
          onAddTerritory={handleOpenAddTerritoryModal}
          onOpenSettings={handleOpenSettings}
          onOpenBibleStudies={handleOpenBibleStudies}
        />
      );
    }
  }
  
  // --- BREADCRUMB LOGIC ---
  let crumbs = [];

  // We only show breadcrumbs if we have navigated away from the home screen
  if (selectedTerritoryId) {
    // 1. The "Home" crumb
    crumbs.push({
      label: 'Territories',
      onClick: () => {
        // ADD a check: ONLY show the alert if they were in an edit mode.
        if (selectedTerritory || selectedStreet) {
          alert("Canceling edit. No changes saved.");
        }
        setSelectedTerritoryId(null);
        setSelectedStreetId(null);
        setSelectedHouse(null);
        setSelectedTerritoryDetails(null);
        setSelectedStreetDetails(null);
        // ADDED: Ensure we exit any edit mode when going home
        setSelectedTerritory(null);
        setSelectedStreet(null);
      }
    });

    // 2. The "Territory" crumb (shows when you're on a street or house)
    if (selectedStreetDetails || selectedStreet) { // Condition updated to include edit mode
      crumbs.push({
        label: `${selectedTerritoryDetails.number}`,
        onClick: () => {
          // ADD a check: ONLY show the alert if they were editing a street.
          if (selectedStreet) {
            alert("Canceling edit. No changes saved.");
          }
          setSelectedStreetId(null);
          setSelectedHouse(null);
          setSelectedStreetDetails(null);
          // ADDED: Ensure we exit street edit mode when going back to territory
          setSelectedStreet(null); 
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


  return ( // --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---
      <>
        {/* --- START: NEW LOADING CHECK --- */}
        {showLoadingIndicator ? (
            <p>Loading data...</p>
        ) : (
          // --- START: This fragment is the single wrapper for the "else" case ---
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

            {isAddStudyModalOpen && (
              <AddStudyModal
                onSave={handleSaveStudy} // We will create this function next
                onClose={handleCloseStudyModal}
                person={personForStudy}
              />
            )}
          </>
          // --- END: This fragment is the single wrapper ---
        )}
        {/* --- END: NEW LOADING CHECK --- */}
      </>
    );
}

export default App;