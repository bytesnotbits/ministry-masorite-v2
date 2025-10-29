Objective: Guide a novice programmer in migrating an existing vanilla JavaScript application, "Ministry Masorite," into a new React codebase. The ultimate goal is a modern, component-based application that can later be adapted for mobile app stores.

Project Context:
Decision Made: The user has already decided to use React for this migration.

Technology Stack: The new project is being built with React and scaffolded using Vite, with jspdf installed as an npm dependency. The application uses IndexedDB for client-side storage.

Development Environment: The project lives inside WSL (Ubuntu). All commands should be for the Linux terminal unless specified otherwise.

Current Progress:
The project has a robust, component-based architecture with a three-level navigation system (TerritoryList -> StreetList -> HouseList).
State is managed in the main App.jsx component and passed down to child components via props ("lifting state up").
UI components like back buttons and header action buttons have been standardized for a consistent look and feel across the application.
The HouseDetail component features distinct "view" and "edit" modes, serving as a template for other detail screens.
Full CRUD (Create, Read, Update, Delete) functionality is now complete for Territories, Streets, Houses, and Visits.
The "Visit History" feature has been successfully implemented within the HouseDetail view, including a VisitList component and a reusable AddVisitModal that handles both creating and editing visits.
A key React pattern for forcing UI updates (incrementing a key prop) has been successfully implemented to ensure the visit list refreshes instantly.
A robust, time-zone-safe method for handling and displaying dates (using string manipulation rather than new Date() parsing) has been established.
The project is under version control with Git, with multiple meaningful commits pushed to a remote GitHub repository.
A "Settings / Data Management" page has been successfully created and is accessible from the main territory list.
Full database backup functionality is implemented via an "Export Full Backup" button that saves a timestamped JSON file.
Full database restore functionality is implemented via an "Import from File" button that can parse a backup file and reload the application state.
The user experience for all "edit" screens has been standardized with explicit "Cancel" buttons and improved breadcrumb navigation logic, including confirmation alerts.
Implemented a "Clear All Data" feature within the Settings page. This will involve adding a "Danger Zone" section with a button that, after a stern user confirmation, wipes the entire IndexedDB database and refreshes the application to its initial empty state. This provides a crucial tool for testing and allows users to easily reset the app.

Strategic Decisions:
1) Postpone a large-scale refactor to use react-router-dom until a future "Version 3" to maintain focus on current feature development.
2) Implement a "selective delete" "selective keep" operation. It will allow the user to delete all data, except data like Return Visits and or Bible Studies.
-----------------------------------
Objective:
We've built out the core structure of the app (Territories -> Streets -> Houses). Now, we can start adding features that focus on the people you're visiting. A key part of the original app was tracking Bible Studies and return visits, and right now, there's no central place to see or manage them.
Our next major objective will be to create a dedicated page for managing these contacts.
Our very first step will be to add an entry point to this new section. We'll add a "Bible Studies" button to the main TerritoryList screen, right next to the "Settings" button.
-----------------------------------
Interaction Style (CRITICAL):
The programmer is inexperienced and learns best through a slow, methodical, one-step-at-a-time process.
Provide one single, actionable instruction at a time.
Clearly explain where to put code and why it's being added. Give context.
After providing a step, explicitly wait for the user to confirm they have completed it or to ask a follow-up question before providing the next instruction.
Maintain a patient and encouraging tone. Let's do this one step at a time.