import React, { useState, useEffect } from 'react';
import { getAllFromStore, getFromStore, getByIndex } from '../database.js';
import Icon from './Icon';
import './LetterQueue.css';

function LetterQueue({ onBack }) {
  const [queue, setQueue] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [threshold, setThreshold] = useState(3);

  useEffect(() => {
    // Load threshold from localStorage
    const savedThreshold = localStorage.getItem('letterQueueThreshold');
    if (savedThreshold) {
      setThreshold(parseInt(savedThreshold, 10));
    }
    fetchQueue();
  }, [threshold]);

  const fetchQueue = async () => {
    const allHouses = await getAllFromStore('houses');

    // Enrich houses with street/territory info and reason
    const enrichedHouses = await Promise.all(
      allHouses.map(async (house) => {
        const street = await getFromStore('streets', house.streetId);
        const territory = street ? await getFromStore('territories', street.territoryId) : null;

        // Determine reasons why house is in queue
        const reasons = [];
        if (house.noTrespassing) reasons.push('noTrespassing');
        if (house.hasGate) reasons.push('gate');
        if (house.isCurrentlyNH && (house.consecutiveNHVisits || 0) >= threshold) {
          reasons.push(`${house.consecutiveNHVisits} attempts`);
        }

        return {
          ...house,
          streetName: street?.name || 'Unknown',
          territoryNumber: territory?.number || '?',
          reasons,
          qualifies: reasons.length > 0
        };
      })
    );

    // Filter to only houses that qualify
    const qualified = enrichedHouses.filter(house => house.qualifies);

    setQueue(qualified);
  };

  const handleLetterSent = async (house) => {
    // Import needed functions
    const { addToStore, updateInStore } = await import('../database.js');

    // 1. Log a LETTER visit
    const today = new Date().toISOString();
    await addToStore('visits', {
      houseId: house.id,
      date: today,
      type: 'LETTER',
      notes: 'Letter sent',
      personId: null
    });

    // 2. Update house
    await updateInStore('houses', {
      ...house,
      letterSent: true,
      lastLetterDate: today,
      isCurrentlyNH: false,
      consecutiveNHVisits: 0
    });

    console.log(`📧 Letter sent to ${house.address}. Counter reset to 0, NH flag cleared.`);

    // 3. Refresh queue
    fetchQueue();
  };

  // Filter based on showCompleted toggle
  const displayedQueue = showCompleted ? queue : queue.filter(h => !h.letterSent);

  return (
    <div className="letter-queue">
      <button className="breadcrumb-button" onClick={onBack}>&larr; Back</button>
      <h2>Letter Queue</h2>

      <div className="queue-controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show Completed
        </label>
        <div className="queue-count">
          {displayedQueue.length} house{displayedQueue.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ul className="queue-list">
        {displayedQueue.map(house => (
          <li key={house.id} className={house.letterSent ? 'completed' : ''}>
            <div className="queue-item-header">
              <div className="queue-item-address">
                <strong>{house.address}</strong>
                <span className="queue-item-location">
                  {house.streetName} • Territory {house.territoryNumber}
                </span>
              </div>
              <div className="queue-item-reasons">
                {house.reasons.map((reason, idx) => {
                  if (reason === 'noTrespassing') {
                    return <span key={idx} className="reason-badge" title="No Trespassing"><Icon name="noTrespassing" className="reason-icon" /> No Trespassing</span>;
                  } else if (reason === 'gate') {
                    return <span key={idx} className="reason-badge" title="Gate"><Icon name="gate" className="reason-icon" /> Gate</span>;
                  } else {
                    return <span key={idx} className="reason-badge" title="Multiple NH attempts"><Icon name="notAtHome" className="reason-icon" /> {reason}</span>;
                  }
                })}
              </div>
            </div>
            <button
              className="letter-sent-btn"
              onClick={() => handleLetterSent(house)}
              disabled={house.letterSent}
            >
              {house.letterSent ? '✓ Letter Sent' : 'Mark Letter Sent'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LetterQueue;
