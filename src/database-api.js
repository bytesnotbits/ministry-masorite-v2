import { clearAllStores } from './database.js';
import jsPDF from 'jspdf';

// --- START: NEW JSON EXPORT/IMPORT SYSTEM ---

export const getStudyHistory = async (studyId) => {
    let url = `${API_URL}/study-history`;
    if (studyId) url += `?studyId=${studyId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch study history');
    return response.json();
};

export const addStudyHistory = async (entry) => {
    const response = await fetch(`${API_URL}/study-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error('Failed to create study history entry');
    return response.json();
};

export const updateStudyHistory = async (entry) => {
    const response = await fetch(`${API_URL}/study-history/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error('Failed to update study history entry');
    return response.json();
};

export const deleteStudyHistory = async (id) => {
    const response = await fetch(`${API_URL}/study-history/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete study history entry');
    return response.json();
};

export async function bundleDataForExport(scope = 'full', id = null) {
    const bundle = {
        meta: {
            version: '1.20.02',
            exportDate: new Date().toISOString(),
            scope: scope,
            appName: 'MinistryScribe'
        },
        data: {
            territories: [],
            streets: [],
            houses: [],
            people: [],
            visits: [],
            studies: [],
            studyHistory: [],
            letterCampaigns: [],
            letters: [],
            letterTemplates: []
        }
    };

    if (scope === 'full') {
        // For a full backup, simply get ALL data from each store. This is more robust.
        bundle.data.territories = await getTerritories();
        bundle.data.streets = await getStreets();
        bundle.data.houses = await getHouses();
        bundle.data.people = await getPeople();
        bundle.data.visits = await getVisits();
        bundle.data.studies = await getStudies();
        bundle.data.studyHistory = await getStudyHistory();

        // Fetch letter data from backend API
        bundle.data.letterCampaigns = await getLetterCampaigns();
        bundle.data.letters = await getLetters();
        bundle.data.letterTemplates = await getLetterTemplates();

    } else if (scope === 'territory' && id) {
        // Partial export logic needs more complex backend filtering or in-memory filtering
        // For now, let's just fetch all and filter in memory to be safe and quick
        const allTerritories = await getTerritories();
        const territory = allTerritories.find(t => t.id === id);
        if (!territory) throw new Error("Territory not found.");
        bundle.data.territories.push(territory);

        const allStreets = await getStreets();
        const streets = allStreets.filter(s => s.territoryId === id);
        bundle.data.streets = streets;

        const allHouses = await getHouses();
        const streetIds = streets.map(s => s.id);
        const houses = allHouses.filter(h => streetIds.includes(h.streetId));
        bundle.data.houses = houses;

        const houseIds = houses.map(h => h.id);

        const allPeople = await getPeople();
        bundle.data.people = allPeople.filter(p => houseIds.includes(p.houseId));

        const allVisits = await getVisits();
        bundle.data.visits = allVisits.filter(v => houseIds.includes(v.houseId));

        const allLetters = await getLetters();
        bundle.data.letters = allLetters.filter(l => houseIds.includes(l.houseId));

    } else if (scope === 'street' && id) {
        const allStreets = await getStreets();
        const street = allStreets.find(s => s.id === id);
        if (!street) throw new Error("Street not found.");
        bundle.data.streets.push(street);

        const allTerritories = await getTerritories();
        const territory = allTerritories.find(t => t.id === street.territoryId);
        if (territory) bundle.data.territories.push(territory);

        const allHouses = await getHouses();
        const houses = allHouses.filter(h => h.streetId === id);
        bundle.data.houses = houses;

        const houseIds = houses.map(h => h.id);

        const allPeople = await getPeople();
        bundle.data.people = allPeople.filter(p => houseIds.includes(p.houseId));

        const allVisits = await getVisits();
        bundle.data.visits = allVisits.filter(v => houseIds.includes(v.houseId));

        const allLetters = await getLetters();
        bundle.data.letters = allLetters.filter(l => houseIds.includes(l.houseId));
    }

    return bundle;
}

export async function handleJsonExport(scope = 'full', id = null) {
    try {
        const bundle = await bundleDataForExport(scope, id);
        const jsonString = JSON.stringify(bundle, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // --- START: DATE/TIME LOGIC ---
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 because it's 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const dateTimeString = `${year}-${month}-${day}_${hours}-${minutes}`;
        // --- END: DATE/TIME LOGIC ---

        let filename = `mm_full_backup_${dateTimeString}.json`;

        if (scope === 'territory') {
            const t = bundle.data.territories[0];
            filename = `mm_territory_${t.number}_${dateTimeString}.json`;
        } else if (scope === 'street') {
            const s = bundle.data.streets[0];
            filename = `mm_street_${s.name.replace(/\s/g, '_')}_${dateTimeString}.json`;
        }

        const file = new File([blob], filename, { type: 'application/json' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Ministry Scribe Backup',
                    text: `Backup file: ${filename}`,
                    files: [file],
                });
            } catch (shareError) {
                // User canceled share or desktop browser blocked it — fallback to download
                console.warn("Share failed or not allowed, falling back to download:", shareError);
                const a = document.createElement('a');
                a.href = URL.createObjectURL(file);
                a.download = filename;
                a.click();
                URL.revokeObjectURL(a.href);
            }
        } else {
            // Default fallback for desktop browsers
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = filename;
            a.click();
            URL.revokeObjectURL(a.href);
        }
    } catch (error) {
        console.error("Export failed:", error);
        alert(`Export failed: ${error.message}`);
    }
}

export function handleFileImport(event, callback) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    // CRITICAL FIX: Clear the input immediately to prevent reload loops
    fileInput.value = '';

    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target.result;
            const data = JSON.parse(content);

            if (!data.meta || data.meta.appName !== 'MinistryScribe' || !data.data) {
                throw new Error("This does not appear to be a valid Ministry Scribe file.");
            }

            if (data.meta.scope === 'full') {
                if (confirm("This will REPLACE all current data with the data from the backup file. This cannot be undone. Continue?")) {
                    await processFullImport(data.data);
                    alert("Full backup restored successfully!");
                    if (callback) callback();
                }
            } else {
                await processPartialImport(data, callback);
            }

        } catch (error) {
            alert(`Import failed: ${error.message}`);
            console.error("Import Error:", error);
        }
    };

    reader.onerror = () => {
        alert('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);
}

export async function processFullImport(data) {
    await clearAllStores();
    // *** FIX: Use the executeMerge function which correctly remaps foreign keys. ***
    await executeMerge(data);
}

async function processPartialImport(bundle, callback) {
    const importedTerritory = bundle.data.territories[0];
    if (!importedTerritory) throw new Error("Import file contains no territory data.");

    const existingTerritories = await getAllFromStore('territories');
    const conflict = existingTerritories.find(t => t.number === importedTerritory.number);

    if (conflict) {
        // Show conflict modal
        document.getElementById('conflict-territory-number').textContent = conflict.number;
        const confirmBtn = document.getElementById('modal-import-confirm-btn');

        // Store data on the button
        confirmBtn.setAttribute('data-bundle', JSON.stringify(bundle));
        confirmBtn.setAttribute('data-conflict', JSON.stringify(conflict));

        // Store callback globally
        window.tempImportCallback = callback;

        // Show the modal
        document.getElementById('import-conflict-modal').classList.remove('hidden');
    } else {
        // No conflict - just merge directly
        await executeMerge(bundle.data);
        alert(`Territory #${importedTerritory.number} imported successfully.`);
        if (callback) callback();
    }
}

export async function executeMerge(data, existingTerritory = null) {
    // Map old IDs (from JSON) to new IDs (generated by this DB instance)
    const idMaps = {
        territories: new Map(),
        streets: new Map(),
        houses: new Map(),
        people: new Map(),
        visits: new Map(),
        studies: new Map(),
        studyHistory: new Map(),
        letterCampaigns: new Map(),
        letters: new Map(),
        letterTemplates: new Map()
    };

    // 1. Process Territories
    if (existingTerritory) {
        // We are merging into an existing territory.
        // The file contains only one territory in a partial import.
        const territoryFromFile = data.territories[0];
        if (territoryFromFile) {
            // Map the ID from the file to the ID of the existing territory.
            idMaps.territories.set(territoryFromFile.id, existingTerritory.id);
        }
    } else {
        // This is the original behavior for a full import or a partial import with no conflict.
        for (const territory of data.territories) {
            const oldId = territory.id;
            delete territory.id;
            const response = await fetch(`${API_URL}/territories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(territory)
            });
            if (!response.ok) throw new Error('Failed to create territory');
            const created = await response.json();
            idMaps.territories.set(oldId, created.id);
        }
    }

    // 2. Process Streets (and link them to new Territory IDs)
    for (const street of data.streets) {
        const oldId = street.id;
        delete street.id;
        // Ensure territoryId is mapped, or default to null if mapping fails
        street.territoryId = idMaps.territories.get(street.territoryId) || null;
        if (!street.territoryId) {
            console.warn('Orphaned street found and skipped during import:', street);
            continue; // Skip streets that can't be linked
        }
        const response = await fetch(`${API_URL}/streets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(street)
        });
        if (!response.ok) throw new Error('Failed to create street');
        const created = await response.json();
        idMaps.streets.set(oldId, created.id);
    }

    // 3. Process Houses (and link them to new Street IDs)
    for (const house of data.houses) {
        const oldId = house.id;
        delete house.id;
        // Ensure streetId is mapped
        house.streetId = idMaps.streets.get(house.streetId) || null;
        if (!house.streetId) {
            console.warn('Orphaned house found and skipped during import:', house);
            continue; // Skip houses that can't be linked
        }

        // CRITICAL: Ensure all boolean fields are present, especially for old imported data
        if (house.isNotInterested === undefined) house.isNotInterested = false;
        if (house.isCurrentlyNH === undefined) house.isCurrentlyNH = true; // Default to true if missing
        if (house.hasGate === undefined) house.hasGate = false;
        if (house.hasMailbox === undefined) house.hasMailbox = false;
        if (house.noTrespassing === undefined) house.noTrespassing = false;
        if (house.consecutiveNHVisits === undefined) house.consecutiveNHVisits = 0;

        const response = await fetch(`${API_URL}/houses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(house)
        });
        if (!response.ok) throw new Error('Failed to create house');
        const created = await response.json();
        idMaps.houses.set(oldId, created.id);
    }

    // 4. Process People (linking to new House IDs or as unattached)
    if (data.people) {
        for (const person of data.people) {
            const oldPersonId = person.id; // Get the old ID before deleting
            const oldHouseId = person.houseId;
            const newHouseId = idMaps.houses.get(oldHouseId);

            // A person can exist without a house (new feature)
            // or must be linked to a house that was successfully imported.
            if (person.houseId === null || newHouseId) {
                delete person.id;
                person.houseId = newHouseId || null; // Assign new ID or keep it null

                const response = await fetch(`${API_URL}/people`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(person)
                });
                if (!response.ok) throw new Error('Failed to create person');
                const created = await response.json();
                idMaps.people.set(oldPersonId, created.id);
            }
        }
    }

    // 5. Process Visits (linking to new House IDs)
    if (data.visits) {
        for (const visit of data.visits) {
            const oldHouseId = visit.houseId;
            const newHouseId = idMaps.houses.get(oldHouseId);
            if (newHouseId) {
                delete visit.id;
                visit.houseId = newHouseId;
                const response = await fetch(`${API_URL}/visits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(visit)
                });
                if (!response.ok) throw new Error('Failed to create visit');
            }
        }
    }
    // 6. Process Studies (linking to new Person IDs)
    if (data.studies) {
        for (const study of data.studies) {
            const oldPersonId = study.personId;
            const newPersonId = idMaps.people.get(oldPersonId);

            // Only import studies for people who were successfully imported.
            if (newPersonId) {
                const oldStudyId = study.id;
                delete study.id;
                study.personId = newPersonId;

                const response = await fetch(`${API_URL}/studies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(study)
                });
                if (!response.ok) throw new Error('Failed to create study');
                const created = await response.json();
                idMaps.studies.set(oldStudyId, created.id);
            }
        }
    }

    // 7. Process Study History (linking to new Study IDs)
    if (data.studyHistory) {
        for (const session of data.studyHistory) {
            const oldStudyId = session.studyId;
            const newStudyId = idMaps.studies.get(oldStudyId);

            // Only import history for studies that were successfully imported.
            if (newStudyId) {
                delete session.id;
                session.studyId = newStudyId;
                const response = await fetch(`${API_URL}/study-history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(session)
                });
                if (!response.ok) throw new Error('Failed to create study history');
            }
        }
    }

    // 8. Process Letter Campaigns
    if (data.letterCampaigns) {
        for (const campaign of data.letterCampaigns) {
            const oldId = campaign.id;
            delete campaign.id;
            const response = await fetch(`${API_URL}/letter-campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaign)
            });
            if (!response.ok) throw new Error('Failed to create letter campaign');
            const created = await response.json();
            idMaps.letterCampaigns.set(oldId, created.id);
        }
    }

    // 9. Process Letters
    if (data.letters) {
        for (const letter of data.letters) {
            const oldHouseId = letter.houseId;
            const newHouseId = idMaps.houses.get(oldHouseId);
            const oldCampaignId = letter.campaignId;
            const newCampaignId = idMaps.letterCampaigns.get(oldCampaignId);
            if (newHouseId) {
                delete letter.id;
                letter.houseId = newHouseId;
                letter.campaignId = newCampaignId || null;
                const response = await fetch(`${API_URL}/letters`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(letter)
                });
                if (!response.ok) throw new Error('Failed to create letter');
            }
        }
    }

    // 10. Process Letter Templates
    if (data.letterTemplates) {
        for (const template of data.letterTemplates) {
            delete template.id;
            const response = await fetch(`${API_URL}/letter-templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
            });
            if (!response.ok) throw new Error('Failed to create letter template');
        }
    }
}


export async function executeOverwrite(bundle, conflict) {
    // Find the territory ID in the current DB that matches the conflict number
    // We must use the stored ID (`conflict.id`) for deletion, not the imported ID.

    // Delete the territory via backend API (cascading delete is handled by the backend)
    const response = await fetch(`${API_URL}/territories/${conflict.id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete territory');
    await executeMerge(bundle.data);
}


export async function handleExportPDF(streetId) {
    // Fetch street from backend
    const response = await fetch(`${API_URL}/streets/${streetId}`);
    if (!response.ok) throw new Error('Failed to fetch street');
    const street = await response.json();

    // Fetch houses for this street from backend
    const housesResponse = await fetch(`${API_URL}/houses`);
    if (!housesResponse.ok) throw new Error('Failed to fetch houses');
    const allHouses = await housesResponse.json();
    const houses = allHouses
        .filter(h => h.streetId === streetId)
        .sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true, sensitivity: 'base' }));

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Street Report: ${street.name}`, 14, 22);
    let y = 30;
    for (const house of houses) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setLineWidth(0.5);
        doc.line(14, y, 196, y);
        y += 7;
        doc.setFontSize(12);
        doc.text(`Address: ${house.address}`, 14, y);
        y += 7;
    }
    doc.save(`${street.name.replace(/[^\w\s]/gi, '').replace(/\s/g, '_')}.pdf`);
}

export async function searchAllData(searchText) {
    const lowerCaseSearch = searchText.toLowerCase().trim();
    if (!lowerCaseSearch) {
        return null; // Return null if search is empty, indicating no search is active
    }

    // This object will hold all our results.
    const matches = {
        territoryIds: new Set(),
        streetIds: new Set(),
        houseIds: new Set()
    };

    // 1. Get all the data we need (from backend now)
    const allTerritories = await getTerritories();
    const allStreets = await getStreets();
    const allHouses = await getHouses();
    const allPeople = await getPeople();
    const allVisits = await getVisits();

    // 2. Create maps for easy lookups to find parent IDs
    const houseToStreetMap = new Map(allHouses.map(h => [h.id, h.streetId]));
    const streetToTerritoryMap = new Map(allStreets.map(s => [s.id, s.territoryId]));

    // Helper function to add all parent IDs when a "deep" match is found
    const addParentIds = (houseId) => {
        if (!houseId) return;
        const streetId = houseToStreetMap.get(houseId);
        if (streetId) {
            matches.streetIds.add(streetId);
            const territoryId = streetToTerritoryMap.get(streetId);
            if (territoryId) {
                matches.territoryIds.add(territoryId);
            }
        }
    };

    // 3. Search through each data type
    // Search Territories (Top Level)
    for (const territory of allTerritories) {
        if (territory.number.toString().toLowerCase().includes(lowerCaseSearch) || (territory.description && territory.description.toLowerCase().includes(lowerCaseSearch))) {
            matches.territoryIds.add(territory.id);
        }
    }

    // Search Streets
    for (const street of allStreets) {
        if (street.name.toLowerCase().includes(lowerCaseSearch)) {
            matches.streetIds.add(street.id);
            matches.territoryIds.add(street.territoryId); // Also add its parent territory
        }
    }

    // Search People
    for (const person of allPeople) {
        if (person.name.toLowerCase().includes(lowerCaseSearch)) {
            matches.houseIds.add(person.houseId);
            addParentIds(person.houseId); // Add the parent street and territory
        }
    }

    // Search Visit Notes
    for (const visit of allVisits) {
        if (visit.notes && visit.notes.toLowerCase().includes(lowerCaseSearch)) {
            matches.houseIds.add(visit.houseId);
            addParentIds(visit.houseId); // Add the parent street and territory
        }
    }

    // Convert Sets to Arrays for easier use later
    return {
        territoryIds: Array.from(matches.territoryIds),
        streetIds: Array.from(matches.streetIds),
        houseIds: Array.from(matches.houseIds)
    };
}

// --- Letter Writing ---
// --- Letter Writing ---
const API_URL = 'http://localhost:3001/api';

export const getLetterCampaigns = async () => {
    const response = await fetch(`${API_URL}/letter-campaigns`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
};

export const addLetterCampaign = async (campaign) => {
    const response = await fetch(`${API_URL}/letter-campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
    });
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
};

export const updateLetterCampaign = async (campaign) => {
    const response = await fetch(`${API_URL}/letter-campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
    });
    if (!response.ok) throw new Error('Failed to update campaign');
    return response.json();
};

export const deleteLetterCampaign = async (id) => {
    const response = await fetch(`${API_URL}/letter-campaigns/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete campaign');
    return response.json();
};

export const getLetters = async (campaignId, houseId) => {
    let url = `${API_URL}/letters?`;
    if (campaignId) url += `campaignId=${campaignId}&`;
    if (houseId) url += `houseId=${houseId}&`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch letters');
    return response.json();
};

export const addLetter = async (letter) => {
    const response = await fetch(`${API_URL}/letters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letter)
    });
    if (!response.ok) throw new Error('Failed to create letter');
    return response.json();
};

export const updateLetter = async (letter) => {
    const response = await fetch(`${API_URL}/letters/${letter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letter)
    });
    if (!response.ok) throw new Error('Failed to update letter');
    return response.json();
};

export const deleteLetter = async (id) => {
    const response = await fetch(`${API_URL}/letters/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete letter');
    return response.json();
};

export const getLetterTemplates = async () => {
    const response = await fetch(`${API_URL}/letter-templates`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
};

export const addLetterTemplate = async (template) => {
    const response = await fetch(`${API_URL}/letter-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
};

export const updateLetterTemplate = async (template) => {
    const response = await fetch(`${API_URL}/letter-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
};

export const deleteLetterTemplate = async (id) => {
    const response = await fetch(`${API_URL}/letter-templates/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete template');
    return response.json();
};
