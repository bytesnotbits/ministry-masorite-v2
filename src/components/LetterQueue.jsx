import React, { useState, useEffect } from 'react';
import { getAllFromStore } from '../database.js';
import './LetterQueue.css';

function LetterQueue({ onBack }) {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    const allHouses = await getAllFromStore('houses');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredHouses = allHouses.filter(house => {
      return house.hasMailbox && (!house.lastLetterDate || new Date(house.lastLetterDate) < thirtyDaysAgo);
    });

    setQueue(filteredHouses);
  };

  return (
    <div className="letter-queue">
      <button className="breadcrumb-button" onClick={onBack}>&larr; Back</button>
      <h2>Letter Queue</h2>
      <ul>
        {queue.map(house => (
          <li key={house.id}>{house.address}</li>
        ))}
      </ul>
    </div>
  );
}

export default LetterQueue;
