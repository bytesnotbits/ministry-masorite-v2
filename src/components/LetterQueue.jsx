import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import './LetterQueue.css';

function LetterQueue({ onBack, onHouseSelect, territories }) {
  const [queue, setQueue] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [threshold, setThreshold] = useState(3);

  useEffect(() => {
    // Load threshold from localStorage
    const savedThreshold = localStorage.getItem('letterQueueThreshold');
    if (savedThreshold) {
      setThreshold(parseInt(savedThreshold, 10));
    }
  }, []);

  useEffect(() => {
    if (territories) {
      processQueue();
    }
  }, [territories, threshold]);

  const processQueue = () => {
    const qualifiedHouses = [];

    territories.forEach(territory => {
      territory.streets.forEach(street => {
        street.houses.forEach(house => {
          // Determine reasons why house is in queue
          const reasons = [];
          if (house.noTrespassing) reasons.push('noTrespassing');
          if (house.hasGate) reasons.push('gate');
          if (house.isCurrentlyNH && (house.consecutiveNHVisits || 0) >= threshold) {
            reasons.push(`${house.consecutiveNHVisits} attempts`);
          }

          if (reasons.length > 0) {
            qualifiedHouses.push({
              ...house,
              streetName: street.name,
              territoryNumber: territory.number,
              reasons,
              qualifies: true
            });
          }
        });
      });
    });

    setQueue(qualifiedHouses);
  };

  const handleLetterSent = async (house) => {
    // 1. Log a LETTER visit
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    const visitData = {
      houseId: house.id,
      date: todayString,
      type: 'LETTER',
      notes: 'Letter sent',
      personId: null
    };

    await fetch('http://localhost:3001/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });

    // 2. Update house
    const updatedHouse = {
      ...house,
      letterSent: true,
      lastLetterDate: todayString, // Use string format
      isCurrentlyNH: false,
      consecutiveNHVisits: 0
    };

    await fetch(`http://localhost:3001/api/houses/${updatedHouse.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedHouse)
    });

    console.log(`📧 Letter sent to ${house.address}. Counter reset to 0, NH flag cleared.`);

    // 3. Refresh queue (local update, parent will refresh via fetchTerritories if needed, but here we just update local state for immediate feedback or wait for parent?
    // Since we don't have a callback to refresh parent territories, we might need to rely on the fact that App.jsx should probably refresh.
    // However, LetterQueue doesn't trigger a refresh in App.jsx.
    // Ideally, we should call a prop like `onQueueUpdate` which calls `fetchTerritories` in App.jsx.
    // For now, let's just update the local queue state to reflect the change.

    // Actually, since we passed `territories` as a prop, we can't easily mutate it. 
    // We should probably ask App.jsx to refresh.
    // But for now, let's just update the local queue list to show it as sent.
    setQueue(prevQueue => prevQueue.map(h => h.id === house.id ? { ...h, letterSent: true } : h));
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
            <div className="queue-item-header" onClick={() => onHouseSelect(house)} style={{ cursor: 'pointer' }}>
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
              onClick={(e) => {
                e.stopPropagation();
                handleLetterSent(house);
              }}
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
