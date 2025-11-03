// src/components/Breadcrumbs.jsx

import React from 'react';
import './Breadcrumbs.css';

function Breadcrumbs({ crumbs }) {
  if (!crumbs || crumbs.length === 0) {
    return null; // Don't render anything if there are no crumbs
  }

return (
    <nav className="breadcrumbs-nav">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {/* Add a separator BEFORE each item, but not the very first one */}
          {/* Skip adding separator if current or previous item is a separator */}
          {index > 0 && crumb.onClick !== null && crumbs[index - 1].onClick !== null && (
            <span className="breadcrumb-separator">&gt;</span>
          )}

          {/* If this is a separator (no onClick), render as plain text */}
          {crumb.onClick === null ? (
            <span className="breadcrumb-separator-custom">{crumb.label}</span>
          ) : (
            <button
              onClick={crumb.onClick}
              className="breadcrumb-button"
            >
              {crumb.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumbs;