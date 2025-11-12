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

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await knex.destroy();
  }
}

seed();
