// src/components/BibleStudiesPage.jsx

import React, { useState, useEffect } from 'react';
import ViewHeader from './ViewHeader.jsx';
import PersonCard from './PersonCard.jsx';
import './BibleStudiesPage.css';

function BibleStudiesPage({ onBack, onPersonSelect, onAssociate, onAddPerson, onViewStudy, people, studies, visits, territories }) {
  const [bibleStudies, setBibleStudies] = useState([]);
  const [returnVisits, setReturnVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!people || !studies || !visits || !territories) return;

    try {
      // Flatten territories to get streets and houses maps
      const allStreets = [];
      const allHouses = [];

      territories.forEach(t => {
        if (t.streets) {
          t.streets.forEach(s => {
            allStreets.push(s);
            if (s.houses) {
              s.houses.forEach(h => {
                allHouses.push(h);
              });
            }
          });
        }
      });

      const housesMap = new Map(allHouses.map(h => [h.id, h]));
      const streetsMap = new Map(allStreets.map(s => [s.id, s]));
      const territoriesMap = new Map(territories.map(t => [t.id, t]));

      const enrichedPeople = people.map(person => {
        const house = housesMap.get(person.houseId);
        const street = house ? streetsMap.get(house.streetId) : null;
        const territory = street ? territoriesMap.get(street.territoryId) : null;
        const study = studies.find(s => s.personId === person.id);
        const personVisits = visits.filter(v => v.personId === person.id || (house && v.houseId === house.id));

        // Sort by date and time (most recent first)
        const lastVisit = personVisits.sort((a, b) => {
          const dateTimeA = `${a.date} ${a.time || '00:00'}`;
          const dateTimeB = `${b.date} ${b.time || '00:00'}`;
          return new Date(dateTimeB) - new Date(dateTimeA);
        })[0];

        return { ...person, house, street, territory, study, lastVisit };
      });

      const activeStudies = enrichedPeople.filter(p => p.study);
      const rvs = enrichedPeople.filter(p => !p.study && p.isRV);

      setBibleStudies(activeStudies);
      setReturnVisits(rvs);
      setLoading(false);

    } catch (err) {
      console.error("Failed to process data for BibleStudiesPage:", err);
      setError("Failed to load data.");
      setLoading(false);
    }
  }, [people, studies, visits, territories]);

  if (loading) {
    return (
      <div className="bible-studies-page-container">
        <ViewHeader title="Return Visits & Bible Studies" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bible-studies-page-container">
        <ViewHeader title="Return Visits & Bible Studies" />
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="bible-studies-page-container">
      <button onClick={onBack} className="back-button">
        &larr; Back to Territories
      </button>

      <ViewHeader title="Return Visits & Bible Studies" />

      <div className="page-actions">
        <button className="primary-action-btn" onClick={onAddPerson}>+ New Contact</button>
      </div>

      <div className="studies-section">
        <h2>Bible Studies ({bibleStudies.length})</h2>
        {bibleStudies.length > 0 ? (
          <div className="person-card-grid">
            {bibleStudies.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                onSelect={onPersonSelect}
                onAssociate={onAssociate}
                onViewStudy={onViewStudy}
              />
            ))}
          </div>
        ) : (
          <p>No active Bible studies.</p>
        )}
      </div>

      <div className="rv-section">
        <h2>Return Visits ({returnVisits.length})</h2>
        {returnVisits.length > 0 ? (
          <div className="person-card-grid">
            {returnVisits.map(person => (
              <PersonCard key={person.id} person={person} onSelect={onPersonSelect} onAssociate={onAssociate} onViewStudy={onViewStudy} />
            ))}
          </div>
        ) : (
          <p>No return visits found.</p>
        )}
      </div>
    </div>
  );
}

export default BibleStudiesPage;