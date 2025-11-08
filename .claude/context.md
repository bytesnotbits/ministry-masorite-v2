# Ministry Masorite v2 - Project Context

## Project Overview
A React-based territory management application for ministry work. Tracks territories, streets, houses, people, visits, Bible studies, and letter-writing campaigns. Data is stored locally using IndexedDB (no backend).

## Tech Stack
- **Frontend**: React 19.1.1 with Vite 7.1.7
- **Database**: IndexedDB (via custom `database.js` wrapper)
- **UI Libraries**: react-burger-menu
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
- **Main Navigation**: A hamburger menu (`react-burger-menu`) controls the top-level views. A single `currentView` state in `App.jsx` determines which main view is shown (`territories`, `bibleStudies`, `settings`, `letterWriting`).
- **Hierarchical Navigation**: Within the main territories view, navigation is hierarchical: Territories → Streets → Houses → House Detail. This is managed by `selectedTerritoryId`, `selectedStreetId`, and `selectedHouse` state variables.
- **Breadcrumbs**: Breadcrumbs are used for navigating up the hierarchy within the territories view.
- **Special Flows**: Bible Studies and Letter Writing pages have their own internal navigation logic.

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

// Delete (with cascading and navigation)
const children = await getByIndex('houses', 'streetId', streetId);
for (const child of children) await deleteFromStore('houses', child.id);
await deleteFromStore('streets', streetId);
setSelectedStreet(null); // Clear edit mode
setSelectedStreetId(null); // Return to list view
await fetchTerritories(); // Refresh stats
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
- **HouseDetail** - House info with sections in order: Notes → Details → toggles → People → Visit History
- **BibleStudiesPage** - All people with studies or RV status
- **StudyDetail** - Study info + visit history for person
- **LetterCampaignList** - Manage letter campaigns
- **LetterQueue** - Houses pending letters
- **LetterTemplates** - Manage letter templates
- **SettingsPage** - Export/import/clear data

### Modals
- Add modals for: Territory, Street, House, Person, Visit, Study
- Most Edit modals have been replaced by inline editing.
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
- Delete operations:
  - Deleting territory: Cascades to streets and houses, returns to TerritoryList
  - Deleting street: Cascades to houses, returns to StreetList, refreshes territory stats
  - Deleting house: Returns to HouseList, refreshes territory stats
- Deleting Letter Sent visit: Shows Yes/No dialog to optionally re-add house to Letter Queue

## Recent Changes & Bug Fixes
### Completed Features (Latest)
- ✓ Standardized delete button styling for People and Visit History.
  - Applied consistent red circular style with centered 'x' to delete buttons in `PeopleList` and `VisitList`.
- ✓ Reimplemented delete functionality for territories and streets.
  - Added delete buttons to territory and street cards.
  - Implemented confirmation dialogs for all delete operations (territories, streets).
  - Ensured cascading deletes for territories (streets, houses) and streets (houses).
  - Fixed UI refresh issue after street deletion by adding `key` prop to `StreetList`.
  - Improved delete button styling (red circle, centered 'x', no overlap).
- ✓ Implemented sequential record navigation for streets and houses.
  - Added a `SequentialNavigator` component with next/previous buttons.
  - Buttons display the name/address of the adjacent record for context.
  - Positioned in the top-right, opposite the hamburger menu.
  - Handlers in `App.jsx` are memoized with `useCallback` to prevent re-render loops.
- ✓ Updated hamburger menu icon color and size for better UI consistency.
- ✓ Implemented a hamburger menu to declutter the main view.
- ✓ Moved "Settings", "RVs / Bible Studies", and "Letter Writing" into the hamburger menu.
- ✓ Refactored navigation logic to use a single `currentView` state for more robust and predictable navigation.
- ✓ Fixed multiple navigation bugs related to view switching and breadcrumb behavior.
- ✓ Refactored Person card UI in HouseDetail view for improved layout and consistency.
  - Moved person's name to be displayed above the action buttons.
  - Standardized the styling of the 'Move', 'Disassociate', and 'Edit' buttons.
  - Relocated the delete (x) button to the top-right corner of the card, on the same line as the person's name.
- ✓ Implemented inline editing for Bible Study details (StudyDetail view).
  - Replaced `EditStudyModal` with `LongPressEditField` for `publication` and `lesson` fields.
  - Removed "Edit Study" button and integrated the "Add Visit" button into a consistent `ViewHeader`.
  - Refactored state management in `App.jsx` to remove modal logic.
- ✓ Implemented inline editing throughout entire app with double-click and long-press support
  - Created InlineEditableText component for editable headers (h2 elements)
  - Created LongPressEditField component for labeled form fields
  - HouseDetail: Address header and notes field are inline editable
  - StreetList: Territory number header and description field are inline editable
  - HouseList: Street name header is inline editable
  - All fields support double-click (300ms window) and long-press (500ms hold)
  - Auto-saves on blur, ESC to cancel, ENTER to save (single-line fields)
  - Removed all Edit buttons (Edit House, Edit Territory, Edit Street)
  - Removed separate edit modes for Territory and Street (TerritoryDetail/StreetDetail no longer rendered)
  - House attributes (NH, NI, Mailbox, NT, Gate) remain as instant toggles
  - Custom double-click detection to work around user-select: none CSS limitations
  - Visual feedback: hover highlights, edit icons, helpful hint text
  - Consistent editing UX across all hierarchical levels (Territory → Street → House)
- ✓ Fixed house editing navigation to stay on HouseDetail view after saving instead of returning to StreetList
- ✓ Enhanced AddHouseModal with attribute toggles (NH, NI, Mbox, NT, Gate)
  - Attributes persist between "Save & New" clicks for faster data entry
  - NH (Not at Home) always checked by default for new houses
  - All attributes reset when modal closes
- ✓ Optimized house attribute toggle buttons for compact layout:
  - Changed from vertical stack to horizontal wrap layout
  - Reduced padding and spacing significantly
  - Shortened labels (NH, NI, Mbox, NT, Gate) to save space
  - Reduced icon size and margins
- ✓ Reduced spacing on filter buttons (FilterBar) for more compact layout
- ✓ Fixed Edit Territory and Edit Street views to use ViewHeader component (title above buttons)
- ✓ Fixed breadcrumbs to wrap on smaller screens and reduced spacing for more compact layout
- ✓ Fixed Edit House button positioning in HouseDetail to render inline with other action buttons
- ✓ Fixed visit history sorting to show newest entries first (both HouseDetail and StudyDetail)
- ✓ Added ConfirmDialog component with Yes/No buttons for better UX
- ✓ Deleting Letter Sent visits now prompts to re-add house to Letter Queue
- ✓ Reordered HouseDetail sections: Notes → Details → People → Visit History
- ✓ Fixed delete operations to properly return to parent list views:
  - Territory deletion → TerritoryList
  - Street deletion → StreetList
  - House deletion → HouseList
- ✓ Fixed `handleDeleteStreet` bug (was using undefined `street.id` instead of parameter `streetId`)

## Known Issues / Pending Features
See `--Features to implement and bugs to fix--.txt`:
- Most major navigation and UX issues have been resolved
- Check feature request file for new features

## Future Direction: Firebase Migration and Mobile App

After extensive discussion, the project's strategic direction has been updated to move away from a local-only database and manual sharing system towards a cloud-based backend to enable real-time collaboration and a path to a native mobile app.

### 1. Backend and Real-Time Sync
- **Decision**: The manual, file-based sharing protocol (outlined in `newShareProtocol.md`) has been **deprecated**. The project will be migrated to use **Firebase Firestore** as its backend.
- **Reasoning**: This will provide seamless, real-time data synchronization between users, eliminating the complexity and potential for user error inherent in a manual file-sharing process. It provides a single source of truth for all data.
- **Critical Requirement - Offline Capability**: The migration to Firebase will make full use of Firestore's built-in offline persistence. The app must remain **100% functional** (both reading and writing data) when users are in areas with no internet connectivity. The Firebase SDK will handle all data caching and automatic synchronization when the connection is restored.

### 2. Security Model
Security is a top priority for this migration. The new architecture will be secure by design, relying on a multi-layered approach:
- **Authentication**: User identity will be managed by **Firebase Authentication**. This provides secure, industry-standard login and user management, preventing unauthorized access.
- **Authorization**: Data access will be controlled by **server-side Firestore Security Rules**. This is the most critical security component. Rules will be written to ensure users can only access their own data or data that has been explicitly shared with them. These rules cannot be bypassed by client-side code.
- **Client-Side Security**: The app will continue to benefit from React's built-in protection against Cross-Site Scripting (XSS). User input is automatically escaped, preventing malicious script injection. The codebase does not use `dangerouslySetInnerHTML`.
- **API Key Safety**: Firebase configuration keys (API keys) are intended to be public identifiers, not secrets. Security is enforced by the Authentication and Firestore Rules on the backend, not by hiding these keys.

### 3. Path to a Native Mobile App
The long-term goal is to release the application on the iOS App Store and Android Play Store. The current development path is the ideal foundation for this.
- **Phase 1 (Current Focus)**: Complete the migration to a robust, offline-capable, real-time web application using React and Firebase.
- **Phase 2 (Future Goal)**: Once the web app is complete, use a modern WebView wrapper like **Capacitor** to package the existing web application into native iOS and Android apps for submission to the app stores.
- **Reasoning for Wrapper Approach**: This approach allows for **100% code reuse** between the web and mobile apps, drastically reducing the development and maintenance effort. Modern wrappers, used by major apps like Microsoft Teams and Slack, provide a high-quality, near-native user experience that is ideal for this application's needs (forms, lists, text). A full rewrite using a native framework like React Native is considered an unnecessary and resource-intensive step.

## Development Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Code Conventions
- Function naming: `handleVerbNoun` (e.g., `handleSaveHouse`, `handleDeletePerson`)
- Async/await for all DB operations
- Cascading deletes for parent-child relationships
- Confirmation dialogs for destructive operations (use ConfirmDialog for Yes/No, window.confirm for OK/Cancel)
- Console logging with emoji for debugging (e.g., `📊`, `🔄`)
- Delete operations must clear both edit state and view state to return to parent list

## Database Schema Notes
- All objects need `id` (auto-generated by IndexedDB)
- Foreign keys: `territoryId`, `streetId`, `houseId`, `personId`, `campaignId`
- Boolean flags: `isCurrentlyNH`, `isNotInterested`, `isRV`, `hasGate`, etc.
- Date fields: ISO string format (`new Date().toISOString()`)

## Performance Considerations
- `fetchTerritories()` enriches territories with all houses (expensive)
- Loading indicator shows after 500ms delay
- Parallel promises used for bulk operations