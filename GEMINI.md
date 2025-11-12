# Project Overview

This is a React-based web application called "Ministry Masorite v2". It appears to be a tool for organizing and tracking ministry-related activities. The application is built using Vite and uses IndexedDB for client-side storage.

The application's UI is structured around a hierarchical view of territories, streets, and houses. Users can manage data related to people, visits, and bible studies. It also includes features for letter writing campaigns.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, and you can access the application at the URL provided in the console.

3.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the production-ready files.

4.  **Lint the code:**
    ```bash
    npm run lint
    ```
    This will run ESLint to check for any code quality issues.

5.  **Preview the production build:**
    ```bash
    npm run preview
    ```
    This will serve the `dist` directory, allowing you to test the production build locally.

## Development Conventions

*   **Code Style:** The project uses ESLint to enforce a consistent code style. The configuration can be found in `eslint.config.js`.
*   **Database:** The application uses IndexedDB for client-side storage. The database logic is handled in `src/database.js` and `src/database-api.js`.
*   **Components:** The UI is built with React components, located in the `src/components` directory.
*   **State Management:** The main application state is managed in the `App.jsx` component using React hooks (`useState`, `useEffect`, etc.).
