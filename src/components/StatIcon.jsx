// src/components/StatIcon.jsx

/* * This component displays an icon with a count.
 * If the count is 0, it renders nothing (null).
 * This is useful for stats that should only show when there's a non-zero value.
 */
/* Why this component is useful:
Reusable: We can use this for any icon/count pair we want, anywhere in the app.
Conditional: The if (count === 0) { return null; } logic is very powerful. It keeps our UI clean by hiding stats that 
aren't relevant.
Simple: It takes just two props: the iconName (like "notAtHome") and the count. */

import React from 'react';
import Icon from './Icon.jsx'; // We'll reuse our existing Icon component
import './StatIcon.css';   // We'll create this CSS file next

function StatIcon({ iconName, count }) {
  // This is the key: if the count is 0, render nothing (null).
  if (count === 0) {
    return null;
  }

  return (
    <div className="stat-icon-wrapper">
      <Icon name={iconName} className={`stat-icon icon-${iconName}`} />
      <span className="stat-count">{count}</span>
    </div>
  );
}

export default StatIcon;