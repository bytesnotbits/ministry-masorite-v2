import { useState, useEffect, useCallback } from 'react'; // We now need useEffect here
import './App.css';
import { clearAllStores } from './database.js';
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
import { handleJsonExport, handleFileImport } from './database-api.js';
import BibleStudiesPage from './components/BibleStudiesPage.jsx';
import AddStudyModal from './components/AddStudyModal.jsx';
import StudyDetail from './components/StudyDetail.jsx';
import AssociatePersonModal from './components/AssociatePersonModal.jsx';
import PersonDetail from './components/PersonDetail.jsx';
import MovePersonModal from './components/MovePersonModal.jsx';
import LetterCampaignList from './components/LetterCampaignList.jsx';
import LetterQueue from './components/LetterQueue.jsx';
import LetterTemplates from './components/LetterTemplates.jsx';
import PhoneCallModal from './components/PhoneCallModal.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import SequentialNavigator from './components/SequentialNavigator.jsx';



import { slide as Menu } from 'react-burger-menu';
import './components/BurgerMenu.css';

function App() {
  // --- STATE ---
  const [isMenuOpen, setMenuOpen] = useState(false);

  const [territories, setTerritories] = useState([]); // Master list of territories now lives here
  const [currentView, setCurrentView] = useState('territories');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState(null);
  const [selectedStreetId, setSelectedStreetId] = useState(null); // We still need this for now
  const [isAddTerritoryModalOpen, setIsAddTerritoryModalOpen] = useState(false);
  const [isAddStreetModalOpen, setIsAddStreetModalOpen] = useState(false);
  const [isAddHouseModalOpen, setIsAddHouseModalOpen] = useState(false);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [houseListKey, setHouseListKey] = useState(0);
  const [visitListKey, setVisitListKey] = useState(0);
  const [streetListKey, setStreetListKey] = useState(0);
  const [peopleListKey, setPeopleListKey] = useState(0); // Add peopleListKey state
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [visitToEdit, setVisitToEdit] = useState(null);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedTerritoryDetails, setSelectedTerritoryDetails] = useState(null);
  const [selectedStreetDetails, setSelectedStreetDetails] = useState(null);
  const [peopleForSelectedHouse, setPeopleForSelectedHouse] = useState([]);
  const [isEditingHouse, setIsEditingHouse] = useState(false);
  const [cameFromBibleStudies, setCameFromBibleStudies] = useState(false);
  const [cameFromLetterQueue, setCameFromLetterQueue] = useState(false);

  const [isLetterQueueVisible, setIsLetterQueueVisible] = useState(false);
  const [isLetterTemplatesVisible, setIsLetterTemplatesVisible] = useState(false);
  const [isLetterWritingVisible, setIsLetterWritingVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isBibleStudiesVisible, setIsBibleStudiesVisible] = useState(false);

  const [isPhoneCallModalOpen, setIsPhoneCallModalOpen] = useState(false);
  const [selectedHouseForPhoneCall, setSelectedHouseForPhoneCall] = useState(null);
  const [showLetterQueueConfirm, setShowLetterQueueConfirm] = useState(false);
  const [houseToAddToQueue, setHouseToAddToQueue] = useState(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmYesText, setConfirmYesText] = useState('Yes');
  const [confirmNoText, setConfirmNoText] = useState('No');

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleUpdateTerritory = async (updatedTerritoryData) => {
    await updateInStore('territories', updatedTerritoryData);
    setSelectedTerritory(null); // Return to the territory list
    await fetchTerritories(); // Re-fetch all territories to show the change
  };

  const handleDeleteTerritory = (territory) => {
    const deleteAction = async () => {
      console.log(`🗑️ Deleting territory ${territory.number} (${territory.id})`);

      // Call backend API to delete territory (backend handles cascading delete)
      await fetch(`http://localhost:3001/api/territories/${territory.id}`, {
        method: 'DELETE'
      });

      // Clear both edit mode and selection to return to TerritoryList
      setSelectedTerritory(null);
      setSelectedTerritoryId(null);
      await fetchTerritories();
    };

    setConfirmAction(() => deleteAction);
    setConfirmMessage(`Are you sure you want to delete Territory ${territory.number}? This will also delete all of its streets and houses.`);
    setConfirmYesText("Yes, Delete");
    setConfirmNoText("No, Cancel");
    setShowConfirmDialog(true);
  };

  const handleBackToTerritoryList = () => {
    setSelectedTerritory(null);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  const [isAddStudyModalOpen, setIsAddStudyModalOpen] = useState(false);
  const [personForStudy, setPersonForStudy] = useState(null);
  const handleCloseStudyModal = () => {
    setIsAddStudyModalOpen(false);
    setPersonForStudy(null);
  };

  const [studies, setStudies] = useState([]);
  const [visits, setVisits] = useState([]); // New visits state
  const [people, setPeople] = useState([]); // New people state
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [personForVisit, setPersonForVisit] = useState(null);
  const [studyVisitListKey, setStudyVisitListKey] = useState(0);
  const [isAssociatePersonModalOpen, setIsAssociatePersonModalOpen] = useState(false);
  const [personToAssociate, setPersonToAssociate] = useState(null);
  const [bibleStudiesPageKey, setBibleStudiesPageKey] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isMovePersonModalOpen, setIsMovePersonModalOpen] = useState(false);
  const [personToMove, setPersonToMove] = useState(null);
  const [houseFilters, setHouseFilters] = useState({
    showNotAtHome: false,
    showNotInterested: false,
    showGate: false,
    showMailbox: false,
    showNoTrespassing: false
  });
  const [showCompleted, setShowCompleted] = useState(false);
  const [sequentialNavProps, setSequentialNavProps] = useState({});

  const handleOpenAssociatePersonModal = (person) => {
    setPersonToAssociate(person);
    setIsAssociatePersonModalOpen(true);
  };

  const handleCloseAssociatePersonModal = () => {
    setPersonToAssociate(null);
    setIsAssociatePersonModalOpen(false);
  };

  const handleAssociatePerson = async (person, houseId) => {
    // Find house, street, territory from state
    let house, street, territory;
    for (const t of territories) {
      for (const s of t.streets) {
        const h = s.houses.find(h => h.id === houseId);
        if (h) { house = h; street = s; territory = t; break; }
      }
      if (house) break;
    }

    const logEntry = {
      personId: person.id,
      date: new Date().toISOString(),
      notes: `Associated with house: ${house.address}, ${street.name}, Terr ${territory.number}`,
      type: 'SYSTEM',
    };
    // await addToStore('visits', logEntry);
    await fetch('http://localhost:3001/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });

    const updatedPerson = { ...person, houseId };
    // await updateInStore('people', updatedPerson);
    await fetch(`http://localhost:3001/api/people/${updatedPerson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPerson)
    });

    handleCloseAssociatePersonModal();
    await fetchPeople();
    await fetchVisits();
    setPeopleListKey(prevKey => prevKey + 1); // Refresh people list
    setBibleStudiesPageKey(prevKey => prevKey + 1);
  };

  const handleOpenMovePersonModal = (person) => {
    setPersonToMove(person);
    setIsMovePersonModalOpen(true);
  };

  const handleCloseMovePersonModal = () => {
    setPersonToMove(null);
    setIsMovePersonModalOpen(false);
  };

  const handleMovePerson = async (person, newHouseId) => {
    // Find old house
    let oldHouse;
    for (const t of territories) {
      for (const s of t.streets) {
        const h = s.houses.find(h => h.id === person.houseId);
        if (h) { oldHouse = h; break; }
      }
      if (oldHouse) break;
    }

    // Find new house
    let newHouse, newStreet, newTerritory;
    for (const t of territories) {
      for (const s of t.streets) {
        const h = s.houses.find(h => h.id === newHouseId);
        if (h) { newHouse = h; newStreet = s; newTerritory = t; break; }
      }
      if (newHouse) break;
    }

    const logEntry = {
      personId: person.id,
      date: new Date().toISOString(),
      notes: `Moved from ${oldHouse.address} to ${newHouse.address}, ${newStreet.name}, Terr ${newTerritory.number}`,
      type: 'SYSTEM',
    };
    // await addToStore('visits', logEntry);
    await fetch('http://localhost:3001/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });

    const updatedPerson = { ...person, houseId: newHouseId };
    // await updateInStore('people', updatedPerson);
    await fetch(`http://localhost:3001/api/people/${updatedPerson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPerson)
    });

    await fetchPeople();
    await fetchVisits();
    setPeopleListKey(prevKey => prevKey + 1); // Refresh people list

    handleCloseMovePersonModal();
  };

  const getStreetWithHouses = useCallback(async (street) => {
    if (!street) return null;
    const housesForStreet = await getByIndex('houses', 'streetId', street.id);
    return {
      ...street,
      houses: housesForStreet,
    };
  }, []);

  // EFFECT: Sync peopleForSelectedHouse when dependencies change
  useEffect(() => {
    if (selectedHouse) {
      const peopleData = people.filter(p => p.houseId === selectedHouse.id);
      const peopleWithStudyStatus = peopleData.map(person => {
        const hasStudy = studies.some(study => study.personId === person.id);
        return { ...person, hasStudy: hasStudy };
      });
      setPeopleForSelectedHouse(peopleWithStudyStatus);
    } else {
      setPeopleForSelectedHouse([]);
    }
  }, [people, selectedHouse, studies]);

  const handleHouseSelect = useCallback((houseObject) => {
    setSelectedHouse(houseObject);
    setCameFromBibleStudies(false);
  }, []);

  const handleNavigateStreets = useCallback(async (direction) => {
    if (!selectedTerritoryId) return;

    const currentTerritory = territories.find(t => t.id === selectedTerritoryId);
    if (!currentTerritory) return;

    const streetsInTerritory = await getByIndex('streets', 'territoryId', currentTerritory.id);
    streetsInTerritory.sort((a, b) => a.name.localeCompare(b.name)); // Ensure consistent order

    const currentIndex = streetsInTerritory.findIndex(s => s.id === selectedStreetId);
    let newIndex = currentIndex;

    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (direction === 'next') {
      newIndex = Math.min(streetsInTerritory.length - 1, currentIndex + 1);
    }

    if (newIndex !== currentIndex) {
      const newStreet = streetsInTerritory[newIndex];
      const streetWithHouses = await getStreetWithHouses(newStreet);
      setSelectedStreetId(newStreet.id);
      setSelectedStreetDetails(streetWithHouses);
      setSelectedHouse(null); // Clear selected house when changing street
    }
  }, [territories, selectedTerritoryId, selectedStreetId, getStreetWithHouses]);

  const handleNavigateHouses = useCallback(async (direction) => {
    if (!selectedStreetId) return;

    const housesInStreet = await getByIndex('houses', 'streetId', selectedStreetId);
    housesInStreet.sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true })); // Sort by address

    const currentIndex = housesInStreet.findIndex(h => h.id === selectedHouse?.id);
    let newIndex = currentIndex;

    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (direction === 'next') {
      newIndex = Math.min(housesInStreet.length - 1, currentIndex + 1);
    }

    if (newIndex !== currentIndex) {
      const newHouse = housesInStreet[newIndex];
      await handleHouseSelect(newHouse); // Use existing handler to set selectedHouse and fetch people
    }
  }, [selectedStreetId, selectedHouse, handleHouseSelect]);



  // --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---   --- DATA FETCHING ---
  // This useEffect runs once to load the initial territory list
  // EFFECT 1: This runs ONCE when the app loads to fetch the initial data.
  useEffect(() => {
    fetchTerritories();
    fetchStudies();
    fetchVisits();
    fetchPeople(); // Fetch people on load
  }, [visitListKey, peopleListKey]); // Add peopleListKey dependency

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

  // EFFECT 3: Calculate sequential navigation properties
  useEffect(() => {
    const calculateNavProps = async () => {
      let newNavProps = {
        prevLabel: '',
        nextLabel: '',
        onPrevClick: () => { },
        onNextClick: () => { },
        isPrevDisabled: true,
        isNextDisabled: true,
      };

      if (selectedStreetId && !selectedHouse) { // Navigating streets within a territory
        const currentTerritory = territories.find(t => t.id === selectedTerritoryId);
        if (currentTerritory && currentTerritory.streets) { // Ensure streets are attached
          const streetsInTerritory = [...currentTerritory.streets].sort((a, b) => a.name.localeCompare(b.name));
          const currentIndex = streetsInTerritory.findIndex(s => s.id === selectedStreetId);

          if (currentIndex > 0) {
            newNavProps.prevLabel = streetsInTerritory[currentIndex - 1].name;
            newNavProps.isPrevDisabled = false;
            newNavProps.onPrevClick = () => handleNavigateStreets('prev');
          }
          if (currentIndex < streetsInTerritory.length - 1) {
            newNavProps.nextLabel = streetsInTerritory[currentIndex + 1].name;
            newNavProps.isNextDisabled = false;
            newNavProps.onNextClick = () => handleNavigateStreets('next');
          }
        }
      } else if (selectedHouse) { // Navigating houses within a street
        if (selectedStreetId) { // Ensure we have a selected street
          const housesInStreet = await getByIndex('houses', 'streetId', selectedStreetId);
          housesInStreet.sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true }));

          const currentIndex = housesInStreet.findIndex(h => h.id === selectedHouse.id);

          if (currentIndex > 0) {
            newNavProps.prevLabel = housesInStreet[currentIndex - 1].address;
            newNavProps.isPrevDisabled = false;
            newNavProps.onPrevClick = () => handleNavigateHouses('prev');
          }
          if (currentIndex < housesInStreet.length - 1) {
            newNavProps.nextLabel = housesInStreet[currentIndex + 1].address;
            newNavProps.isNextDisabled = false;
            newNavProps.onNextClick = () => handleNavigateHouses('next');
          }
        }
      }
      setSequentialNavProps(newNavProps);
    };
    calculateNavProps();
  }, [selectedTerritoryId, selectedStreetId, selectedHouse, territories, handleNavigateStreets, handleNavigateHouses]); // Dependencies

  /* This function fetches the list of territories and enriches each with its houses 
  Finding all its child streets.
  Then, for all of those streets, we find all their child houses.
  Finally, we bundle all of those houses together into a single houses array and attach it directly to the territory object.
  This gives our TerritoryList component all the data it will need to calculate the territory-wide stats.
  */
  const fetchTerritories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/territories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let enrichedTerritories = await response.json();

      // --- NEW: Convert integer booleans to true booleans ---
      enrichedTerritories = enrichedTerritories.map(territory => ({
        ...territory,
        houses: territory.houses.map(house => ({
          ...house,
          hasMailbox: !!house.hasMailbox,
          noTrespassing: !!house.noTrespassing,
          isCurrentlyNH: !!house.isCurrentlyNH,
          hasGate: !!house.hasGate,
          isNotInterested: !!house.isNotInterested,
          letterSent: !!house.letterSent,
        })),
      }));
      // --- END NEW ---

      // --- NEW: Nest houses within streets ---
      const processedTerritories = enrichedTerritories.map(territory => {
        const housesByStreet = territory.houses.reduce((acc, house) => {
          if (!acc[house.streetId]) {
            acc[house.streetId] = [];
          }
          acc[house.streetId].push(house);
          return acc;
        }, {});

        const streetsWithHouses = territory.streets.map(street => ({
          ...street,
          houses: housesByStreet[street.id] || [],
        }));

        return {
          ...territory,
          streets: streetsWithHouses,
        };
      });
      // --- END NEW ---

      setTerritories(processedTerritories);
      return processedTerritories; // Return the processed data
    } catch (error) {
      console.error("Failed to fetch territories:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/studies');
      if (!response.ok) throw new Error('Failed to fetch studies');
      const studiesData = await response.json();
      setStudies(studiesData);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
    }
  };

  const fetchVisits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/visits');
      if (!response.ok) throw new Error('Failed to fetch visits');
      const visitsData = await response.json();
      setVisits(visitsData);
    } catch (error) {
      console.error("Failed to fetch visits:", error);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/people');
      if (!response.ok) throw new Error('Failed to fetch people');
      const peopleData = await response.json();
      setPeople(peopleData);
    } catch (error) {
      console.error("Failed to fetch people:", error);
    }
  };


  // --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---   --- HANDLERS ---
  // Removed handleEditTerritory - territories are now editable inline on StreetList

  const handleUpdateStreet = async (updatedStreetData) => {
    await updateInStore('streets', updatedStreetData);
    setSelectedStreet(null); // Go back to the list
    setStreetListKey(prevKey => prevKey + 1); // Refresh the list
  };

  const handleSaveTerritoryInline = async (updatedTerritoryData) => {
    // await updateInStore('territories', updatedTerritoryData);
    await fetch(`http://localhost:3001/api/territories/${updatedTerritoryData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTerritoryData)
    });
    await fetchTerritories(); // Refresh the list
  };

  const handleSaveStreetInline = async (updatedStreetData) => {
    // await updateInStore('streets', updatedStreetData);
    await fetch(`http://localhost:3001/api/streets/${updatedStreetData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStreetData)
    });
    setStreetListKey(prevKey => prevKey + 1); // Refresh the list
    await fetchTerritories(); // Refresh territories to update stats
  };

  const handleDeleteStreet = (street) => {
    const deleteAction = async () => {
      console.log(`🗑️ Deleting street ${street.name} (${street.id})`);

      // Call backend API to delete street (backend handles cascading delete)
      await fetch(`http://localhost:3001/api/streets/${street.id}`, {
        method: 'DELETE'
      });

      // Clear both edit mode and selection to return to StreetList
      setSelectedStreet(null);
      setSelectedStreetId(null);
      setStreetListKey(prevKey => prevKey + 1);
      await fetchTerritories(); // Refresh territories to update stats
    };

    setConfirmAction(() => deleteAction);
    setConfirmMessage(`Are you sure you want to delete ${street.name}? This will also delete all of its houses.`);
    setConfirmYesText("Yes, Delete");
    setConfirmNoText("No, Cancel");
    setShowConfirmDialog(true);
  };

  const handleBackToStreetList = () => {
    setSelectedStreet(null);
  };

  const handleSaveTerritory = async (newTerritory, shouldClose = true) => {
    // await addToStore('territories', newTerritory); // Save to the database
    await fetch('http://localhost:3001/api/territories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTerritory)
    });
    await fetchTerritories(); // Re-fetch the list to include the new one
    if (shouldClose) {
      setIsAddTerritoryModalOpen(false); // Close the modal only if requested
    }
  };

  // Removed handleEditStreet - streets are now editable inline on HouseList

  const handleSaveStreet = async (streetData, shouldClose = true) => {
    // 1. Combine the street name from the modal with the currently selected territory ID
    const newStreet = {
      ...streetData, // This copies the { name: '...' } object from the modal
      territoryId: selectedTerritoryId, // This adds the ID of the parent territory
    };

    // 2. Save the complete street object to the database
    // await addToStore('streets', newStreet);
    await fetch('http://localhost:3001/api/streets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStreet)
    });

    // 3. Re-fetch the territories and refresh the street list
    await fetchTerritories();
    setStreetListKey(prevKey => prevKey + 1);

    // 4. Close the modal only if requested
    if (shouldClose) {
      setIsAddStreetModalOpen(false);
    }
  };

  const handleSaveHouse = async (houseData, shouldClose = true) => {
    // 1. Combine the house data from the modal with the currently selected street ID
    const newHouse = {
      ...houseData,
      streetId: selectedStreetId,
    };

    // 2. Save the complete house object to the database
    // await addToStore('houses', newHouse);
    await fetch('http://localhost:3001/api/houses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHouse)
    });

    // 3. Refresh territories list and force the HouseList to re-render
    await fetchTerritories();
    setHouseListKey(prevKey => prevKey + 1);

    // 4. Close the modal only if requested
    if (shouldClose) {
      setIsAddHouseModalOpen(false);
    }
  };

  const handleOpenAddHouseModal = () => setIsAddHouseModalOpen(true);
  const handleCloseHouseModal = () => setIsAddHouseModalOpen(false);

  const handleOpenVisitModal = (person = null) => {
    setPersonForVisit(person);
    setIsAddVisitModalOpen(true);
  };
  const handleCloseVisitModal = () => {
    setIsAddVisitModalOpen(false);
    setVisitToEdit(null); // Also reset the state on cancel/close
    setPersonForVisit(null); // Reset person
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
      // await updateInStore('people', updatedPerson);
      await fetch(`http://localhost:3001/api/people/${updatedPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPerson)
      });
    } else {
      // --- ADD (CREATE) LOGIC ---
      const newPerson = {
        ...personData,
        houseId: selectedHouse ? selectedHouse.id : null,
      };
      // await addToStore('people', newPerson);
      await fetch('http://localhost:3001/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPerson)
      });
    }

    // --- This runs for BOTH adds and updates ---
    await fetchPeople(); // Refresh people list from API
    setPeopleListKey(prevKey => prevKey + 1); // Force the PeopleList to refresh
    setBibleStudiesPageKey(prevKey => prevKey + 1); // Force the BibleStudiesPage to refresh
    handleClosePersonModal();                   // Close the modal
  };

  const handleStreetSelect = (streetId) => {
    const territory = territories.find(t => t.id === selectedTerritoryId);
    const street = territory.streets.find(s => s.id === streetId);
    setSelectedStreetDetails(street);
    setSelectedStreetId(streetId);
    setCameFromBibleStudies(false);
    setCameFromLetterQueue(false);
  };

  const handleUpdateHouse = async (updatedHouseData, stayOnPage = false) => {
    try {
      const response = await fetch(`http://localhost:3001/api/houses/${updatedHouseData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHouseData),
      });

      if (!response.ok) {
        throw new Error('Failed to update house on the server');
      }

      const savedHouse = await response.json();

      // Convert integer booleans to true booleans (SQLite returns 0/1)
      const convertedHouse = {
        ...savedHouse,
        hasMailbox: !!savedHouse.hasMailbox,
        noTrespassing: !!savedHouse.noTrespassing,
        isCurrentlyNH: !!savedHouse.isCurrentlyNH,
        hasGate: !!savedHouse.hasGate,
        isNotInterested: !!savedHouse.isNotInterested,
        letterSent: !!savedHouse.letterSent,
      };

      // The backend has been updated. Now, re-fetch all data to sync the frontend.
      const freshTerritories = await fetchTerritories();

      // CRITICAL FIX: Update selectedStreetDetails with the refreshed data
      // This ensures the HouseList has the latest house data when navigating via breadcrumbs
      if (selectedStreetId && freshTerritories) {
        const updatedTerritory = freshTerritories.find(t => t.id === selectedTerritoryId);
        if (updatedTerritory) {
          const updatedStreet = updatedTerritory.streets.find(s => s.id === selectedStreetId);
          if (updatedStreet) {
            setSelectedStreetDetails(updatedStreet);
          }
        }
      }

      if (stayOnPage) {
        // After re-fetching, the `territories` state is updated, but not in this closure.
        // We will set the selected house from the immediate response of the PUT request
        // to keep the detail view open and updated.
        setSelectedHouse(convertedHouse);
      } else {
        setSelectedHouse(null);
      }

    } catch (error) {
      console.error('Error updating house:', error);
    }
  };

  const handleDeleteHouse = async (houseId) => {
    // 1. Delete the item from the database using its ID
    // await deleteFromStore('houses', houseId);
    await fetch(`http://localhost:3001/api/houses/${houseId}`, {
      method: 'DELETE'
    });

    // 2. Clear the selected house to return to the HouseList view
    setSelectedHouse(null);

    // 3. Increment the key to force the HouseList to re-fetch and show the updated list
    setHouseListKey(prevKey => prevKey + 1);

    // 4. Refresh territories to update stats
    await fetchTerritories();
  };

  const handleGoBack = () => {
    if (isLetterQueueVisible) {
      setIsLetterQueueVisible(false);
    } else if (isLetterTemplatesVisible) {
      setIsLetterTemplatesVisible(false);
    } else if (isLetterWritingVisible) {
      setIsLetterWritingVisible(false);
    } else if (selectedStreetId) {
      setSelectedStreetId(null);
    } else if (selectedTerritoryId) {
      setSelectedTerritoryId(null);
    }
  };

  const handleStartStudy = (person) => {
    setPersonForStudy(person); // Store the person we're starting a study with
    setIsAddStudyModalOpen(true); // Open the modal
  };

  const handleViewStudy = (person) => {
    const study = studies.find(s => s.personId === person.id);
    setSelectedStudy({ ...study, person });
  };


  const navigateTo = (view) => {
    setCurrentView(view);
    setSelectedTerritoryId(null);
    setSelectedStreetId(null);
    setSelectedHouse(null);
    setSelectedPerson(null);
    setSelectedStudy(null);
    setMenuOpen(false);
  };

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
      const updatedVisit = {
        ...visitToEdit,
        ...visitData
      };
      // await updateInStore('visits', updatedVisit);
      await fetch(`http://localhost:3001/api/visits/${updatedVisit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVisit)
      });
    } else {
      // --- ADD (CREATE) LOGIC ---
      let newVisit;
      let houseId;

      if (personForVisit) {
        // Case 1: Visit added from StudyDetail view
        newVisit = {
          ...visitData,
          personId: personForVisit.id,
          houseId: personForVisit.houseId,
        };
        houseId = personForVisit.houseId;
      } else if (selectedHouse) {
        // Case 2: Visit added from HouseDetail view
        newVisit = {
          ...visitData,
          houseId: selectedHouse.id,
        };
        houseId = selectedHouse.id;
      } else {
        console.error("Cannot save visit: no house or person is selected.");
        return;
      }

      // await addToStore('visits', newVisit);
      await fetch('http://localhost:3001/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisit)
      });

      // --- NEW: Track consecutive NH visits ---
      if (houseId && visitData.type !== 'LETTER') {
        // Find house in territories state
        let house = null;
        for (const t of territories) {
          for (const s of t.streets) {
            const h = s.houses.find(h => h.id === houseId);
            if (h) { house = h; break; }
          }
          if (house) break;
        }

        if (house && house.isCurrentlyNH) {
          // House is still marked as NH, increment the counter
          const newCount = (house.consecutiveNHVisits || 0) + 1;
          const updatedHouse = {
            ...house,
            consecutiveNHVisits: newCount
          };
          // await updateInStore('houses', updatedHouse);
          await fetch(`http://localhost:3001/api/houses/${updatedHouse.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedHouse)
          });
          console.log(`📊 Consecutive NH visits incremented: ${house.consecutiveNHVisits || 0} → ${newCount} for house ${house.address}`);
          await fetchTerritories(); // Refresh territories to update house state
        }
      }
    }

    // --- This runs for both adds and updates ---
    await fetchVisits(); // Refresh visits from API
    setVisitListKey(prevKey => prevKey + 1); // Refresh HouseDetail
    setStudyVisitListKey(prevKey => prevKey + 1); // Refresh StudyDetail
    setIsAddVisitModalOpen(false); // Close the modal
    setVisitToEdit(null); // Reset the visitToEdit state
    setPersonForVisit(null); // Reset person for visit
  };

  // Handler for "Log NH" button - creates a Not At Home visit directly
  const handleLogNH = async (house) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    const timeString = `${hours}:${minutes}`;

    const visitData = {
      date: todayString,
      time: timeString,
      notes: 'Not at home',
      personId: null,
      type: 'Not At Home',
      houseId: house.id,
    };

    // await addToStore('visits', visitData);
    await fetch('http://localhost:3001/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });

    // Track consecutive NH visits if house is marked as NH
    if (house.isCurrentlyNH) {
      // const freshHouse = await getFromStore('houses', house.id);
      // Use the house passed in, assuming it's relatively fresh, or rely on the fact that we just need to increment
      // Actually, better to use the one from territories to be safe, or just increment what we have.
      // Since we are in the handler, `house` comes from the UI.
      const newCount = (house.consecutiveNHVisits || 0) + 1;
      const updatedHouse = {
        ...house,
        consecutiveNHVisits: newCount
      };
      // await updateInStore('houses', updatedHouse);
      await fetch(`http://localhost:3001/api/houses/${updatedHouse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHouse)
      });
      console.log(`📊 Consecutive NH visits incremented for ${house.address}`);
      await fetchTerritories(); // Refresh territories
    }

    // Refresh the house list
    await fetchVisits();
    setHouseListKey(prevKey => prevKey + 1);
    setVisitListKey(prevKey => prevKey + 1);
  };

  // Handler for opening phone call modal
  const handleOpenPhoneCallModal = (house) => {
    setSelectedHouseForPhoneCall(house);
    setIsPhoneCallModalOpen(true);
  };

  // Handler for saving phone call from modal
  const handleSavePhoneCall = async (visitData, houseId) => {
    const newVisit = {
      ...visitData,
      houseId: houseId,
    };

    // await addToStore('visits', newVisit);
    await fetch('http://localhost:3001/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVisit)
    });

    // Track consecutive NH visits if house is marked as NH
    // const house = await getFromStore('houses', houseId);
    let house = null;
    for (const t of territories) {
      for (const s of t.streets) {
        const h = s.houses.find(h => h.id === houseId);
        if (h) { house = h; break; }
      }
      if (house) break;
    }

    if (house && house.isCurrentlyNH) {
      const newCount = (house.consecutiveNHVisits || 0) + 1;
      const updatedHouse = {
        ...house,
        consecutiveNHVisits: newCount
      };
      // await updateInStore('houses', updatedHouse);
      await fetch(`http://localhost:3001/api/houses/${updatedHouse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHouse)
      });
      console.log(`📊 Consecutive NH visits incremented for ${house.address}`);
      await fetchTerritories();
    }

    // Close modal and refresh lists
    await fetchVisits();
    setIsPhoneCallModalOpen(false);
    setSelectedHouseForPhoneCall(null);
    setHouseListKey(prevKey => prevKey + 1);
    setVisitListKey(prevKey => prevKey + 1);
  };

  const handleSaveStudy = async (studyData) => {
    // 1. Save the new study to the database
    // await addToStore('studies', studyData);
    await fetch('http://localhost:3001/api/studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studyData)
    });

    // 2. Ensure the person is marked as an RV
    // const person = await getFromStore('people', studyData.personId);
    const person = people.find(p => p.id === studyData.personId);
    if (person && !person.isRV) {
      // person.isRV = true; // Directly modify the object we already have
      // await updateInStore('people', person);
      const updatedPerson = { ...person, isRV: true };
      await fetch(`http://localhost:3001/api/people/${updatedPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPerson)
      });
    }

    // 3. Re-fetch the studies to update the app's state
    await fetchStudies();
    await fetchPeople(); // Refresh people to show RV status

    // 4. THE FIX: Manually refresh the people list for the current house
    // (Handled by useEffect now)
    setPeopleListKey(prevKey => prevKey + 1);

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
      // await deleteFromStore('people', personId);
      await fetch(`http://localhost:3001/api/people/${personId}`, {
        method: 'DELETE'
      });

      await fetchPeople(); // Refresh people list
      setPeopleListKey(prevKey => prevKey + 1); // Force the PeopleList to refresh
    }
  };

  const handleEditPerson = (personObject) => {
    setPersonToEdit(personObject); // 1. Store the person we want to edit
    setIsAddPersonModalOpen(true);    // 2. Open the modal
  };

  const handleDisassociatePerson = async (person) => {
    if (window.confirm(`Are you sure you want to disassociate ${person.name} from this house?`)) {
      // 1. Log the disassociation in the visit history
      const logEntry = {
        personId: person.id,
        date: new Date().toISOString(),
        notes: `Disassociated from house.`,
        type: 'SYSTEM',
      };
      // await addToStore('visits', logEntry);
      await fetch('http://localhost:3001/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });

      // 2. Update the person's houseId to null
      const updatedPerson = { ...person, houseId: null };
      // await updateInStore('people', updatedPerson);
      await fetch(`http://localhost:3001/api/people/${updatedPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPerson)
      });

      // 3. Refresh the PeopleList for the current house
      await fetchPeople();
      await fetchVisits();
      setPeopleListKey(prevKey => prevKey + 1);

      // 4. Refresh the BibleStudiesPage
      setBibleStudiesPageKey(prevKey => prevKey + 1);
    }
  };

  const handleTerritorySelect = (territoryId) => {
    const territory = territories.find(t => t.id === territoryId);
    setSelectedTerritoryDetails(territory);
    setSelectedTerritoryId(territoryId);
    setCameFromBibleStudies(false);
    setCameFromLetterQueue(false);
  };

  const handleDeleteVisit = async (visitId) => {
    // 1. Get the visit before deleting to check if it's a letter
    // const visit = await getFromStore('visits', visitId);
    const visit = visits.find(v => v.id === visitId);

    if (!visit) {
      console.error('Visit not found');
      return;
    }

    // Show a confirmation dialog before deleting
    if (window.confirm('Are you sure you want to permanently delete this visit?')) {
      // 2. Delete the visit from the database using its ID
      // await deleteFromStore('visits', visitId);
      await fetch(`http://localhost:3001/api/visits/${visitId}`, {
        method: 'DELETE'
      });

      // 3. If this was a LETTER visit, ask if they want to add house back to Letter Queue
      if (visit.type === 'LETTER' && visit.houseId) {
        // const house = await getFromStore('houses', visit.houseId);
        let house = null;
        for (const t of territories) {
          for (const s of t.streets) {
            const h = s.houses.find(h => h.id === visit.houseId);
            if (h) { house = h; break; }
          }
          if (house) break;
        }

        if (house) {
          // Store house and show custom Yes/No dialog
          setHouseToAddToQueue(house);
          setShowLetterQueueConfirm(true);
        }
      }

      // 4. Increment the key to force the component to re-fetch and show the updated list
      await fetchVisits();
      setVisitListKey(prevKey => prevKey + 1);
    }
  };

  const handleAddToLetterQueueYes = async () => {
    if (houseToAddToQueue) {
      // Clear the letterSent flag to add it back to the queue
      const updatedHouse = {
        ...houseToAddToQueue,
        letterSent: false,
        lastLetterDate: null
      };
      // await updateInStore('houses', updatedHouse);
      await fetch(`http://localhost:3001/api/houses/${updatedHouse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHouse)
      });

      // Refresh territories to update the stats
      await fetchTerritories();

      console.log(`📬 House ${houseToAddToQueue.address} added back to Letter Queue`);
    }

    // Close dialog and reset state
    setShowLetterQueueConfirm(false);
    setHouseToAddToQueue(null);
  };

  const handleAddToLetterQueueNo = () => {
    // Just close dialog and reset state
    setShowLetterQueueConfirm(false);
    setHouseToAddToQueue(null);
  };

  const handleEditVisit = (visitObject) => {
    setVisitToEdit(visitObject);      // Store the visit we want to edit
    setIsAddVisitModalOpen(true); // Open the modal
  };

  const handlePersonSelect = async (person) => {

    if (person.houseId) {

      const house = await getFromStore('houses', person.houseId);

      const street = await getFromStore('streets', house.streetId);

      const territory = await getFromStore('territories', street.territoryId);



      const streetWithHouses = await getStreetWithHouses(street);
      setSelectedTerritoryDetails(territory);
      setSelectedTerritoryId(territory.id);
      setSelectedStreetDetails(streetWithHouses);
      setSelectedStreetId(street.id);
      await handleHouseSelect(house);

      setCurrentView('territories');
      setCameFromBibleStudies(true);
    } else {

      setSelectedPerson(person);

      setCurrentView('personDetail');
      setCameFromBibleStudies(true);

    }
  };

  const handleHouseSelectFromLetterQueue = async (house) => {
    const street = await getFromStore('streets', house.streetId);
    const territory = await getFromStore('territories', street.territoryId);

    const streetWithHouses = await getStreetWithHouses(street);
    setSelectedTerritoryDetails(territory);
    setSelectedTerritoryId(territory.id);
    setSelectedStreetDetails(streetWithHouses);
    setSelectedStreetId(street.id);
    await handleHouseSelect(house);
    setIsLetterQueueVisible(false);
    setIsLetterWritingVisible(false);
    setCameFromLetterQueue(true);
  }; const handleUpdateStudy = async (updatedStudyData) => {
    // await updateInStore('studies', updatedStudyData);
    await fetch(`http://localhost:3001/api/studies/${updatedStudyData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStudyData)
    });
    await fetchStudies(); // Re-fetch all studies to update the UI
    setSelectedStudy({ ...updatedStudyData, person: selectedStudy.person }); // Update the currently viewed study
  };

  const handleBackToBibleStudies = () => {
    setSelectedPerson(null);
    setIsBibleStudiesVisible(true);
  };

  const handleBreadcrumbClick = (level) => {
    if (isEditingHouse) {
      alert("Canceling edit. No changes saved.");
      setIsEditingHouse(false);
    }

    switch (level) {
      case 'territories':
        setCurrentView('territories');
        setSelectedTerritoryId(null);
        setSelectedStreetId(null);
        setSelectedHouse(null);
        setSelectedTerritoryDetails(null);
        setSelectedStreetDetails(null);
        setSelectedPerson(null);
        setSelectedStudy(null);
        setCameFromBibleStudies(false);
        setCameFromLetterQueue(false);
        break;
      case 'territory':
        setSelectedStreetId(null);
        setSelectedHouse(null);
        setSelectedStreetDetails(null);
        setSelectedPerson(null);
        setSelectedStudy(null);
        break;
      case 'street':
        setSelectedHouse(null);
        setSelectedPerson(null);
        setSelectedStudy(null);
        break;
      default:
        break;
    }
  };




  // --- RENDER LOGIC ---   --- RENDER LOGIC ---   --- RENDER LOGIC ---   --- RENDER LOGIC ---   --- RENDER LOGIC ---
  let currentViewComponent;
  switch (currentView) {
    case 'personDetail':
      currentViewComponent = <PersonDetail person={selectedPerson} onBack={() => navigateTo('bibleStudies')} onAddVisit={handleOpenVisitModal} onAssociate={handleOpenAssociatePersonModal} onViewStudy={handleViewStudy} onDeleteVisit={handleDeleteVisit} onEditVisit={handleEditVisit} visits={visits} studies={studies} />;
      break;
    case 'bibleStudies':
      currentViewComponent = <BibleStudiesPage key={bibleStudiesPageKey} onBack={() => navigateTo('territories')} onPersonSelect={handlePersonSelect} onAssociate={handleOpenAssociatePersonModal} onAddPerson={handleAddPerson} onViewStudy={handleViewStudy} people={people} studies={studies} visits={visits} territories={territories} />;
      break;
    case 'settings':
      currentViewComponent = <SettingsPage onBack={() => navigateTo('territories')} onExport={handleExportData} onImport={handleImportData} onClearAllData={handleClearAllData} />;
      break;
    case 'letterWriting':
      currentViewComponent = <LetterCampaignList onBack={() => navigateTo('territories')} onOpenLetterQueue={() => setCurrentView('letterQueue')} onOpenLetterTemplates={() => setCurrentView('letterTemplates')} territories={territories} />;
      break;
    case 'letterQueue':
      currentViewComponent = <LetterQueue onBack={() => setCurrentView('letterWriting')} onHouseSelect={handleHouseSelectFromLetterQueue} territories={territories} />;
      break;
    case 'letterTemplates':
      currentViewComponent = <LetterTemplates onBack={() => setCurrentView('letterWriting')} />;
      break;
    default:
      if (selectedStudy) {
        currentViewComponent = <StudyDetail study={selectedStudy} onBack={() => setSelectedStudy(null)} onDeleteVisit={handleDeleteVisit} onEditVisit={handleEditVisit} onAddVisit={handleOpenVisitModal} studyVisitListKey={studyVisitListKey} onUpdateStudy={handleUpdateStudy} visits={visits} />;
      } else if (selectedHouse) {
        currentViewComponent = <HouseDetail people={peopleForSelectedHouse} house={selectedHouse} visits={visits.filter(v => v.houseId === selectedHouse.id)} onSave={handleUpdateHouse} onDelete={handleDeleteHouse} onAddVisit={handleOpenVisitModal} onDeleteVisit={handleDeleteVisit} onEditVisit={handleEditVisit} onAddPerson={handleAddPerson} onDeletePerson={handleDeletePerson} onEditPerson={handleEditPerson} onDisassociatePerson={handleDisassociatePerson} onMovePerson={handleOpenMovePersonModal} visitListKey={visitListKey} onStartStudy={handleStartStudy} onViewStudy={handleViewStudy} setIsEditingHouse={setIsEditingHouse} />;
      } else if (selectedStreetId) {
        currentViewComponent = <HouseList street={selectedStreetDetails} onAddHouse={handleOpenAddHouseModal} onHouseSelect={handleHouseSelect} onSaveStreet={handleSaveStreetInline} filters={houseFilters} onFilterChange={setHouseFilters} onLogNH={handleLogNH} onPhoneCall={handleOpenPhoneCallModal} key={houseListKey} />;
      } else if (selectedTerritoryId) {
        currentViewComponent = <StreetList key={streetListKey} territory={selectedTerritoryDetails} onStreetSelect={handleStreetSelect} onAddStreet={handleOpenAddStreetModal} onSaveTerritory={handleSaveTerritoryInline} onDeleteStreet={handleDeleteStreet} showCompleted={showCompleted} onToggleCompleted={setShowCompleted} />;
      } else {
        currentViewComponent = <TerritoryList territories={territories} onTerritorySelect={handleTerritorySelect} onAddTerritory={handleOpenAddTerritoryModal} onDeleteTerritory={handleDeleteTerritory} showCompleted={showCompleted} onToggleCompleted={setShowCompleted} />;
      }
      break;
  }

  // --- BREADCRUMB LOGIC ---
  let crumbs = [];

  if (selectedStudy) {
    crumbs.push({
      label: 'Back',
      onClick: () => handleBreadcrumbClick('street')
    });
  } else if (selectedPerson) {
    crumbs.push({
      label: 'Back',
      onClick: () => handleBreadcrumbClick('territories')
    });
  } else if (currentView === 'bibleStudies' || currentView === 'letterWriting' || currentView === 'settings') {
    // No breadcrumbs on top-level menu pages
  } else if (selectedTerritoryId) {
    // Standard hierarchical breadcrumbs
    crumbs.push({
      label: 'Territories',
      onClick: () => handleBreadcrumbClick('territories')
    });

    if (selectedStreetId) {
      crumbs.push({
        label: `${selectedTerritoryDetails.number}`,
        onClick: () => handleBreadcrumbClick('territory')
      });
    }

    if (selectedHouse) {
      crumbs.push({
        label: selectedStreetDetails.name,
        onClick: () => handleBreadcrumbClick('street')
      });
    }
  }
  // --- END BREADCRUMB LOGIC ---


  return ( // --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---   --- RETURN ---
    <div id="outer-container">
      <Menu pageWrapId={"page-wrap"} outerContainerId={"outer-container"} isOpen={isMenuOpen} onStateChange={(state) => setMenuOpen(state.isOpen)}>
        <a className="menu-item" onClick={() => navigateTo('bibleStudies')}>RVs / Bible Studies</a>
        <a className="menu-item" onClick={() => navigateTo('letterWriting')}>Letter Writing</a>
        <a className="menu-item" onClick={() => navigateTo('settings')}>Settings</a>
      </Menu>
      <main id="page-wrap">
        {/* --- START: NEW LOADING CHECK --- */}
        {showLoadingIndicator ? (
          <p>Loading data...</p>
        ) : (
          // --- START: This fragment is the single wrapper for the "else" case ---
          <>
            {!selectedTerritoryId && !selectedStudy && <h1>Ministry Masorite v2</h1>}
            {selectedStudy && <h1>Study with {selectedStudy.person.name}</h1>}
            <Breadcrumbs crumbs={crumbs} />
            {currentViewComponent}

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
                personForVisit={personForVisit}
              />
            )}

            {isAddPersonModalOpen && (
              <AddPersonModal
                onSave={handleSavePerson}
                onClose={handleClosePersonModal}
                personToEdit={personToEdit}
              />
            )}

            {isPhoneCallModalOpen && selectedHouseForPhoneCall && (
              <PhoneCallModal
                house={selectedHouseForPhoneCall}
                onSave={handleSavePhoneCall}
                onClose={() => {
                  setIsPhoneCallModalOpen(false);
                  setSelectedHouseForPhoneCall(null);
                }}
              />
            )}

            {isAddStudyModalOpen && (
              <AddStudyModal
                onSave={handleSaveStudy} // We will create this function next
                onClose={handleCloseStudyModal}
                person={personForStudy}
              />
            )}

            {isAssociatePersonModalOpen && (
              <AssociatePersonModal
                person={personToAssociate}
                onSave={handleAssociatePerson}
                onClose={handleCloseAssociatePersonModal}
                territories={territories}
              />
            )}

            {isMovePersonModalOpen && (
              <MovePersonModal
                person={personToMove}
                onSave={handleMovePerson}
                onClose={handleCloseMovePersonModal}
                territories={territories}
              />
            )}

            {showLetterQueueConfirm && (
              <ConfirmDialog
                message="Would you like to add this house back to the Letter Queue?"
                onYes={handleAddToLetterQueueYes}
                onNo={handleAddToLetterQueueNo}
                yesText="Yes"
                noText="No"
              />
            )}

            {showConfirmDialog && (
              <ConfirmDialog
                message={confirmMessage}
                onYes={handleConfirm}
                onNo={handleCancel}
                yesText={confirmYesText}
                noText={confirmNoText}
              />
            )}
          </>
          // --- END: This fragment is the single wrapper ---
        )}
        {/* --- END: NEW LOADING CHECK --- */}
        {(!showLoadingIndicator && (selectedStreetId || selectedHouse)) && (
          <SequentialNavigator
            prevLabel={sequentialNavProps.prevLabel}
            nextLabel={sequentialNavProps.nextLabel}
            onPrevClick={sequentialNavProps.onPrevClick}
            onNextClick={sequentialNavProps.onNextClick}
            isPrevDisabled={sequentialNavProps.isPrevDisabled}
            isNextDisabled={sequentialNavProps.isNextDisabled}
          />
        )}
      </main>
    </div>
  );
}

export default App;