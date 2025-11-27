const fs = require('fs/promises');
const path = require('path');
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

async function seed() {
  try {
    // Read the JSON file
    const jsonPath = path.resolve(__dirname, '../public/ministry_scribe_full_backup 10-13-25 0935.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(jsonData);

    // --- Territories ---
    const territories = data.data.territories;
    if (!territories || territories.length === 0) {
      console.log('No territories found in the JSON file.');
      // return; // Do not return, other tables might exist
    } else {
      await knex('territories').del();
      console.log('Cleared existing territories.');
      const territoriesToInsert = territories.map(t => ({
        id: t.id,
        number: t.number,
        description: t.description
      }));
      await knex('territories').insert(territoriesToInsert);
      console.log(`Inserted ${territoriesToInsert.length} territories.`);
    }

    // --- Streets ---
    const streets = data.data.streets;
    if (!streets || streets.length === 0) {
      console.log('No streets found in the JSON file.');
    } else {
      await knex('streets').del();
      console.log('Cleared existing streets.');
      const streetsToInsert = streets.map(s => ({
        id: s.id,
        territoryId: s.territoryId,
        name: s.name
      }));
      await knex('streets').insert(streetsToInsert);
      console.log(`Inserted ${streetsToInsert.length} streets.`);
    }

    // --- Houses ---
    const houses = data.data.houses;
    if (!houses || houses.length === 0) {
      console.log('No houses found in the JSON file.');
    } else {
      await knex('houses').del();
      console.log('Cleared existing houses.');
      const housesToInsert = houses.map(h => ({
        id: h.id,
        streetId: h.streetId,
        address: h.address,
        hasMailbox: h.hasMailbox,
        noTrespassing: h.noTrespassing,
        isCurrentlyNH: h.isCurrentlyNH,
        hasGate: h.hasGate,
        isNotInterested: h.isNotInterested,
        consecutiveNHVisits: h.consecutiveNHVisits || 0,
        letterSent: h.letterSent || false,
        lastLetterDate: h.lastLetterDate || null
      }));
      await knex('houses').insert(housesToInsert);
      console.log(`Inserted ${housesToInsert.length} houses.`);
    }

    // --- People ---
    const people = data.data.people;
    if (!people || people.length === 0) {
      console.log('No people found in the JSON file.');
    } else {
      await knex('people').del();
      console.log('Cleared existing people.');
      const peopleToInsert = people.map(p => ({
        id: p.id,
        houseId: p.houseId,
        name: p.name,
        isRV: p.isRV || false
      }));
      await knex('people').insert(peopleToInsert);
      console.log(`Inserted ${peopleToInsert.length} people.`);
    }

    // --- Visits ---
    const visits = data.data.visits;
    if (!visits || visits.length === 0) {
      console.log('No visits found in the JSON file.');
    } else {
      await knex('visits').del();
      console.log('Cleared existing visits.');
      const visitsToInsert = visits.map(v => ({
        id: v.id,
        houseId: v.houseId || null,
        personId: v.personId || null,
        date: v.date,
        notes: v.notes,
        isNotAtHome: v.isNotAtHome || false,
        isVisitAttempt: v.isVisitAttempt || false
      }));
      // Insert in chunks to avoid SQLite limits if many visits
      const chunkSize = 50;
      for (let i = 0; i < visitsToInsert.length; i += chunkSize) {
        await knex('visits').insert(visitsToInsert.slice(i, i + chunkSize));
      }
      console.log(`Inserted ${visitsToInsert.length} visits.`);
    }

    // --- Studies ---
    const studies = data.data.studies;
    if (!studies || studies.length === 0) {
      console.log('No studies found in the JSON file.');
    } else {
      await knex('studies').del();
      console.log('Cleared existing studies.');
      const studiesToInsert = studies.map(s => ({
        id: s.id,
        personId: s.personId,
        publication: s.publication,
        currentLesson: s.currentLesson,
        lessonProgress: s.lessonProgress,
        isActive: s.isActive !== undefined ? s.isActive : true,
        createdAt: s.createdAt,
        goals: s.goals ? JSON.stringify(s.goals) : null
      }));
      await knex('studies').insert(studiesToInsert);
      console.log(`Inserted ${studiesToInsert.length} studies.`);
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await knex.destroy();
  }
}

seed();
