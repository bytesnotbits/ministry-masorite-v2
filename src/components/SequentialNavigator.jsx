import React from 'react';
import './SequentialNavigator.css';

function SequentialNavigator({ prevLabel, nextLabel, onPrevClick, onNextClick, isPrevDisabled, isNextDisabled }) {
  return (
    <div className="sequential-navigator">
      <button
        onClick={onPrevClick}
        disabled={isPrevDisabled}
        aria-label={prevLabel ? `Previous: ${prevLabel}` : "Previous Record"}
        className="nav-button prev-button"
      >
        {prevLabel || '<'}
      </button>
      <button
        onClick={onNextClick}
        disabled={isNextDisabled}
        aria-label={nextLabel ? `Next: ${nextLabel}` : "Next Record"}
        className="nav-button next-button"
      >
        {nextLabel || '>'}
      </button>
    </div>
  );
}

export default SequentialNavigator;
