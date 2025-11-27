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
3.  **Database Schema**: Migrations have been created for `territories`, `streets`, `houses`, and `people` tables, preserving the relationships from the original data model.
4.  **Data Seeding**: A `seed.js` script has been created to read the `public/ministry_scribe_full_backup 10-13-25 0935.json` file and populate the new database tables.
5.  **API Development**:
    - The `GET /api/territories` endpoint now serves the full, enriched territory data, including nested streets and houses.
    - A `GET /api/people` endpoint has been created.
6.  **Frontend Refactoring (Read Operations)**:
    - `App.jsx` now fetches the main territory data from the `/api/territories` endpoint instead of IndexedDB.
    - The `TerritoryList`, `StreetList`, and `HouseList` components have been refactored into "dumb" components that receive data as props, removing their internal data-fetching logic.
    - Navigation from territories to streets, and from streets to houses, is now working with the backend data.
7.  **CSP Configuration**: A Content Security Policy has been added to `index.html` to allow the frontend to communicate with the backend in the development environment.

### Next Steps:
1.  Migrate the remaining "read" operations for `people`, `visits`, and `studies`.
2.  Migrate all "write" operations (add, update, delete) for all data types to use backend API endpoints instead of IndexedDB.
3.  Create the necessary `POST`, `PUT`, and `DELETE` endpoints in the backend.
4.  Remove the old IndexedDB-related code (`database.js`, `database-api.js`, and calls to them in the components).

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
