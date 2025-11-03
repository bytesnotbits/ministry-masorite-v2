# Ministry Masorite v2 - Project Context

## Project Overview
A React-based territory management application for ministry work. Tracks territories, streets, houses, people, visits, Bible studies, and letter-writing campaigns. Data is stored locally using IndexedDB (no backend).

## Tech Stack
- **Frontend**: React 19.1.1 with Vite 7.1.7
- **Database**: IndexedDB (via custom `database.js` wrapper)
- **PDF Generation**: jsPDF 3.0.3
- **Language**: JavaScript (no TypeScript)
- **Styling**: CSS (App.css + component-level styles)

## Architecture & Patterns

### State Management
- All state lives in `App.jsx` (no Redux/Context)
- State lifted to App level and passed down via props
- Key pattern: `key` props force child component re-renders after data changes

### Data Model (IndexedDB stores)
1. **territories** - Top-level geographic units (has `number`, `name`, `houses[]`)
2. **streets** - Belong to territories (`territoryId`)
3. **houses** - Belong to streets (`streetId`), track visit status flags
4. **people** - Belong to houses (`houseId`), can be RVs (return visits)
5. **visits** - Visit logs for houses/people (types: Visit, Not At Home, Phone Call, Letter, SYSTEM)
6. **studies** - Bible studies linked to people (`personId`)
7. **letterCampaigns** - Letter-writing campaign definitions
8. **letterTemplates** - Reusable letter templates
9. **letters** - Individual letters in queue (`houseId`, `campaignId`, status)

### Key Files
- **App.jsx** - Main component with all state and handlers (~1300 lines)
- **database.js** - IndexedDB wrapper (getAllFromStore, addToStore, updateInStore, deleteFromStore, getByIndex)
- **database-api.js** - Higher-level DB operations (merge, export, import)
- **components/** - All UI components (modals, lists, detail views)

### Navigation Pattern
Hierarchical breadcrumb navigation:
- Territories → Territory → Streets → Street → Houses → House Detail
- Special flows: Bible Studies page, Letter Queue, Settings
- State tracked via: `selectedTerritoryId`, `selectedStreetId`, `selectedHouse`, etc.
- "Came from" flags: `cameFromBibleStudies`, `cameFromLetterQueue` for return navigation

### Common Patterns

#### CRUD Operations
```javascript
// Create
await addToStore('houses', newHouse);
await fetchTerritories(); // Re-fetch to update UI
setHouseListKey(prev => prev + 1); // Force re-render

// Read
const house = await getFromStore('houses', houseId);
const houses = await getByIndex('houses', 'streetId', streetId);

// Update
await updateInStore('houses', updatedHouse);

// Delete (with cascading)
const children = await getByIndex('houses', 'streetId', street.id);
for (const child of children) await deleteFromStore('houses', child.id);
await deleteFromStore('streets', street.id);
```

#### Modal Pattern
- Open: `setIsAddHouseModalOpen(true)`
- Close: `setIsAddHouseModalOpen(false)` + reset edit state
- Save: async handler → save to DB → refresh lists → close modal

#### List Refresh Pattern
- Use `key={someKey}` on list components
- Increment key to force re-fetch: `setHouseListKey(prev => prev + 1)`

#### Custom Confirmation Dialog Pattern
```javascript
// State for dialog
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [dataForConfirm, setDataForConfirm] = useState(null);

// Show dialog
setDataForConfirm(someData);
setShowConfirmDialog(true);

// Handlers
const handleYes = async () => {
  // Process action with dataForConfirm
  setShowConfirmDialog(false);
  setDataForConfirm(null);
};

const handleNo = () => {
  setShowConfirmDialog(false);
  setDataForConfirm(null);
};

// Render
{showConfirmDialog && (
  <ConfirmDialog
    message="Your question here?"
    onYes={handleYes}
    onNo={handleNo}
  />
)}
```

## Component Organization

### Main Views
- **TerritoryList** - Home screen showing all territories
- **StreetList** - Streets in a territory
- **HouseList** - Houses on a street (with filters)
- **HouseDetail** - House info + people + visit history
- **BibleStudiesPage** - All people with studies or RV status
- **StudyDetail** - Study info + visit history for person
- **LetterCampaignList** - Manage letter campaigns
- **LetterQueue** - Houses pending letters
- **LetterTemplates** - Manage letter templates
- **SettingsPage** - Export/import/clear data

### Modals
- Add/Edit modals for: Territory, Street, House, Person, Visit, Study
- Utility modals: AssociatePerson, MovePerson, PhoneCall
- **ConfirmDialog** - Reusable custom confirmation dialog with Yes/No buttons (replaces window.confirm for better UX)

## Important Features

### Visit Tracking
- Types: Visit, Not At Home, Phone Call, Letter, SYSTEM
- Consecutive NH tracking: `consecutiveNHVisits` counter
- Quick "Log NH" button creates visit instantly
- Visit history sorted newest first (most recent at top)
- Deleting a Letter Sent visit prompts user to add house back to Letter Queue (with Yes/No dialog)

### House Filters
- Filter by status flags: Not At Home, Not Interested, Gate, Mailbox, No Trespassing
- Show/hide completed houses

### Data Persistence
- Export: Full JSON backup via `handleJsonExport`
- Import: Merge strategy via `handleFileImport` + `executeMerge`
- Clear: Complete database wipe

### Special Logic
- Auto-mark person as RV when starting study
- Disassociate person logs SYSTEM visit
- Moving person logs SYSTEM visit with new address
- Resetting NH status resets consecutive counter

## Known Issues / Pending Features
See `--Features to implement and bugs to fix--.txt`:
- LetterQueue: Add click to navigate to HouseDetail ✓ (completed)
- HouseDetail: Deleting Letter Sent visit should prompt to re-add to queue ✓ (completed with Yes/No dialog)
- Delete operations should properly return to parent list view

## Development Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Code Conventions
- Function naming: `handleVerbNoun` (e.g., `handleSaveHouse`, `handleDeletePerson`)
- Async/await for all DB operations
- Cascading deletes for parent-child relationships
- Confirmation dialogs for destructive operations
- Console logging with emoji for debugging (e.g., `📊`, `🔄`)

## Database Schema Notes
- All objects need `id` (auto-generated by IndexedDB)
- Foreign keys: `territoryId`, `streetId`, `houseId`, `personId`, `campaignId`
- Boolean flags: `isCurrentlyNH`, `isNotInterested`, `isRV`, `hasGate`, etc.
- Date fields: ISO string format (`new Date().toISOString()`)

## Performance Considerations
- `fetchTerritories()` enriches territories with all houses (expensive)
- Loading indicator shows after 500ms delay
- Parallel promises used for bulk operations
