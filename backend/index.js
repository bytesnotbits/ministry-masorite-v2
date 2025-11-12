const express = require('express');
const cors = require('cors');
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/people', async (req, res) => {
  try {
    const people = await knex('people').select('*').orderBy('name', 'asc');
    res.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/territories', async (req, res) => {
  try {
    const territoryData = await knex('territories').select('*').orderBy('number', 'asc');

    const territoriesWithStatsPromises = territoryData.map(async (territory) => {
      const streetsForTerritory = await knex('streets').where({ territoryId: territory.id }).select('*');

      const housePromises = streetsForTerritory.map(street =>
        knex('houses').where({ streetId: street.id }).select('*')
      );

      const housesByStreet = await Promise.all(housePromises);
      const allHousesForTerritory = housesByStreet.flat();

      return { ...territory, streets: streetsForTerritory, houses: allHousesForTerritory };
    });

    const enrichedTerritories = await Promise.all(territoriesWithStatsPromises);
    res.json(enrichedTerritories);
  } catch (error) {
    console.error('Error fetching territories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/houses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHouse = req.body;
    
    delete updatedHouse.id;

    const numUpdated = await knex('houses').where({ id }).update(updatedHouse);

    if (numUpdated === 0) {
      return res.status(404).json({ error: 'House not found' });
    }

    const house = await knex('houses').where({ id }).first();
    res.json(house);
  } catch (error) {
    console.error('Error updating house:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
