# Ministry Masorite v2 - Project Context

## Project Overview
A React-based territory management application for ministry work. Tracks territories, streets, houses, people, visits, Bible studies, and letter-writing campaigns. The project is currently in the process of migrating from a local-only IndexedDB storage to a Node.js/Express backend with a SQLite database.

## Tech Stack
- **Frontend**: React 19.1.1 with Vite 7.1.7
- **Backend (In Progress)**: Node.js, Express, SQLite, Knex.js
- **Database**: Migrating from IndexedDB (via custom `database.js` wrapper) to a backend SQLite database.
- **UI Libraries**: react-burger-menu
- **PDF Generation**: jsPDF 3.0.3
- **Language**: JavaScript (no TypeScript)
- **Styling**: CSS (App.css + component-level styles)

## Architecture & Patterns

### State Management
- All state lives in `App.jsx` (no Redux/Context)
- State lifted to App level and passed down via props
- Key pattern: `key` props force child component re-renders after data changes

### Data Model (Migrating to SQL)
The data model is being migrated from IndexedDB stores to SQL tables.

1.  **territories** - Top-level geographic units (has `number`, `description`)
2.  **streets** - Belong to territories (`territoryId`)
3.  **houses** - Belong to streets (`streetId`), track visit status flags
4.  **people** - Belong to houses (`houseId`), can be RVs (return visits)
5.  **visits** - (To be migrated)
6.  **studies** - (To be migrated)
7.  **letterCampaigns** - (To be migrated)
8.  **letterTemplates** - (To be migrated)
9.  **letters** - (To be migrated)

### Backend API (In Progress)
A backend has been created in the `/backend` directory.
- `GET /api/health`: Health check.
- `GET /api/territories`: Returns all territories, enriched with their streets and houses.
- `GET /api/people`: Returns all people.

### Key Files
- **App.jsx** - Main component with all state and handlers (~1300 lines)
- **database.js** - (Being phased out) IndexedDB wrapper.
- **backend/index.js** - The main backend server file.
- **backend/knexfile.js** - Knex.js database configuration.
- **backend/migrations/** - Database schema migrations.
- **backend/seed.js** - Script to populate the database from a JSON backup.
- **components/** - All UI components (modals, lists, detail views)

## Backend Migration (In Progress)

The project is currently undergoing a migration from a local-only IndexedDB architecture to a client-server architecture with a Node.js backend.

### Completed Steps:
1.  **Backend Setup**: A new `backend` directory has been created with a Node.js and Express.js server.
2.  **Database Integration**: The backend is connected to a SQLite database using Knex.js for query building and migrations.
3.  **Database Schema**: Migrations have been created for `territories`, `streets`, `houses`, `people`, `visits`, and `studies` tables, preserving the relationships from the original data model.
4.  **Data Seeding**: A `seed.js` script has been created to read the `public/ministry_scribe_full_backup 10-13-25 0935.json` file and populate all database tables including visits and studies.
5.  **API Development (Read Operations)**:
    - `GET /api/territories` - Returns enriched territory data with nested streets and houses
    - `GET /api/people` - Returns all people
    - `GET /api/visits` - Returns all visits
    - `GET /api/studies` - Returns all studies
    - `PUT /api/houses/:id` - Updates house data (write operation)
6.  **Frontend Refactoring (Read Operations - COMPLETE)**:
    - `App.jsx` now fetches `territories`, `people`, `visits`, and `studies` from the backend API on load.
    - All components (`TerritoryList`, `StreetList`, `HouseList`, `HouseDetail`, `BibleStudiesPage`, `PersonDetail`) have been refactored to receive data as props instead of fetching from IndexedDB.
    - Auto-refresh logic implemented: data is re-fetched from the API when `visitListKey` or `peopleListKey` changes.
    - House updates are persisted to the backend via `PUT /api/houses/:id`.
7.  **CSP Configuration**: A Content Security Policy has been added to `index.html` to allow the frontend to communicate with the backend in the development environment.

### Next Steps:
1.  Migrate all remaining "write" operations (add, update, delete) for territories, streets, houses, people, visits, and studies to use backend API endpoints instead of IndexedDB.
2.  Create the necessary `POST`, `PUT`, and `DELETE` endpoints in the backend for all data types.
3.  Remove the old IndexedDB-related code (`database.js`, `database-api.js`, and calls to them in the components).
4.  Test the complete migration to ensure data persists correctly across reloads.

## Development Commands
- **Frontend**: `npm run dev` - Start dev server
- **Backend**: `cd backend && npm start`
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Code Conventions
- Function naming: `handleVerbNoun` (e.g., `handleSaveHouse`, `handleDeletePerson`)
- Async/await for all DB/API operations
- Cascading deletes for parent-child relationships
- Confirmation dialogs for destructive operations
- Console logging with emoji for debugging (e.g., `📊`, `🔄`)
- Delete operations must clear both edit state and view state to return to parent list
