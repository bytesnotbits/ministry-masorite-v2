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

app.post('/api/people', async (req, res) => {
  try {
    const newPerson = req.body;
    const [id] = await knex('people').insert(newPerson);
    const person = await knex('people').where({ id }).first();
    res.json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPerson = req.body;
    delete updatedPerson.id;

    const numUpdated = await knex('people').where({ id }).update(updatedPerson);

    if (numUpdated === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const person = await knex('people').where({ id }).first();
    res.json(person);
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numDeleted = await knex('people').where({ id }).delete();

    if (numDeleted === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Internal server error' });

    app.post('/api/territories', async (req, res) => {
      try {
        const newTerritory = req.body;
        const [id] = await knex('territories').insert(newTerritory);
        const territory = await knex('territories').where({ id }).first();
        res.json(territory);
      } catch (error) {
        console.error('Error creating territory:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.put('/api/territories/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updatedTerritory = req.body;
        delete updatedTerritory.id;
        delete updatedTerritory.streets; // Don't try to update nested data
        delete updatedTerritory.houses;

        const numUpdated = await knex('territories').where({ id }).update(updatedTerritory);

        if (numUpdated === 0) {
          return res.status(404).json({ error: 'Territory not found' });
        }

        const territory = await knex('territories').where({ id }).first();
        res.json(territory);
      } catch (error) {
        console.error('Error updating territory:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.delete('/api/territories/:id', async (req, res) => {
      try {
        const { id } = req.params;
        // Cascading delete is handled by database constraints usually, but let's be safe/explicit if needed.
        // For now assuming SQLite foreign keys are ON or we do it manually.
        // The frontend logic did manual cascade. Let's try to rely on DB or do manual here.
        // Given the previous frontend logic, it's safer to do manual cascade here or ensure FKs.
        // Let's do manual cascade to be safe and match previous logic.

        await knex.transaction(async (trx) => {
          const streets = await trx('streets').where({ territoryId: id });
          for (const street of streets) {
            const houses = await trx('houses').where({ streetId: street.id });
            for (const house of houses) {
              await trx('visits').where({ houseId: house.id }).delete();
              await trx('people').where({ houseId: house.id }).delete();
              await trx('houses').where({ id: house.id }).delete();
            }
            await trx('streets').where({ id: street.id }).delete();
          }
          await trx('territories').where({ id }).delete();
        });

        res.json({ message: 'Territory deleted successfully' });
      } catch (error) {
        console.error('Error deleting territory:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/api/streets', async (req, res) => {
      try {
        const newStreet = req.body;
        const [id] = await knex('streets').insert(newStreet);
        const street = await knex('streets').where({ id }).first();
        res.json(street);
      } catch (error) {
        console.error('Error creating street:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.put('/api/streets/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updatedStreet = req.body;
        delete updatedStreet.id;
        delete updatedStreet.houses;

        const numUpdated = await knex('streets').where({ id }).update(updatedStreet);

        if (numUpdated === 0) {
          return res.status(404).json({ error: 'Street not found' });
        }

        const street = await knex('streets').where({ id }).first();
        res.json(street);
      } catch (error) {
        console.error('Error updating street:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.delete('/api/streets/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await knex.transaction(async (trx) => {
          const houses = await trx('houses').where({ streetId: id });
          for (const house of houses) {
            await trx('visits').where({ houseId: house.id }).delete();
            await trx('people').where({ houseId: house.id }).delete();
            await trx('houses').where({ id: house.id }).delete();
          }
          await trx('streets').where({ id }).delete();
        });
        res.json({ message: 'Street deleted successfully' });
      } catch (error) {
        console.error('Error deleting street:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/api/houses', async (req, res) => {
      try {
        const newHouse = req.body;
        const [id] = await knex('houses').insert(newHouse);
        const house = await knex('houses').where({ id }).first();
        res.json(house);
      } catch (error) {
        console.error('Error creating house:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.delete('/api/houses/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await knex.transaction(async (trx) => {
          await trx('visits').where({ houseId: id }).delete();
          await trx('people').where({ houseId: id }).delete();
          await trx('houses').where({ id }).delete();
        });
        res.json({ message: 'House deleted successfully' });
      } catch (error) {
        console.error('Error deleting house:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.post('/api/studies', async (req, res) => {
      try {
        const newStudy = req.body;
        const [id] = await knex('studies').insert(newStudy);
        const study = await knex('studies').where({ id }).first();
        res.json(study);
      } catch (error) {
        console.error('Error creating study:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.put('/api/studies/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const updatedStudy = req.body;
        delete updatedStudy.id;
        delete updatedStudy.person; // Don't try to update nested person data

        const numUpdated = await knex('studies').where({ id }).update(updatedStudy);

        if (numUpdated === 0) {
          return res.status(404).json({ error: 'Study not found' });
        }

        const study = await knex('studies').where({ id }).first();
        res.json(study);
      } catch (error) {
        console.error('Error updating study:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.delete('/api/studies/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const numDeleted = await knex('studies').where({ id }).delete();

        if (numDeleted === 0) {
          return res.status(404).json({ error: 'Study not found' });
        }

        res.json({ message: 'Study deleted successfully' });
      } catch (error) {
        console.error('Error deleting study:', error);
        res.status(500).json({ error: 'Internal server error' });

        // --- Letter Campaigns ---
        app.get('/api/letter-campaigns', async (req, res) => {
          try {
            const campaigns = await knex('letter_campaigns').select('*');
            res.json(campaigns);
          } catch (error) {
            console.error('Error fetching letter campaigns:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.post('/api/letter-campaigns', async (req, res) => {
          try {
            const newCampaign = req.body;
            const [id] = await knex('letter_campaigns').insert(newCampaign);
            const campaign = await knex('letter_campaigns').where({ id }).first();
            res.json(campaign);
          } catch (error) {
            console.error('Error creating letter campaign:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.put('/api/letter-campaigns/:id', async (req, res) => {
          try {
            const { id } = req.params;
            const updatedCampaign = req.body;
            delete updatedCampaign.id;

            const numUpdated = await knex('letter_campaigns').where({ id }).update(updatedCampaign);
            if (numUpdated === 0) return res.status(404).json({ error: 'Campaign not found' });

            const campaign = await knex('letter_campaigns').where({ id }).first();
            res.json(campaign);
          } catch (error) {
            console.error('Error updating letter campaign:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.delete('/api/letter-campaigns/:id', async (req, res) => {
          try {
            const { id } = req.params;
            await knex('letter_campaigns').where({ id }).delete();
            res.json({ message: 'Campaign deleted successfully' });
          } catch (error) {
            console.error('Error deleting letter campaign:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        // --- Letters ---
        app.get('/api/letters', async (req, res) => {
          try {
            const { campaignId } = req.query;
            let query = knex('letters').select('*');
            if (campaignId) {
              query = query.where({ campaignId });
            }
            const letters = await query;
            res.json(letters);
          } catch (error) {
            console.error('Error fetching letters:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.post('/api/letters', async (req, res) => {
          try {
            const newLetter = req.body;
            const [id] = await knex('letters').insert(newLetter);
            const letter = await knex('letters').where({ id }).first();
            res.json(letter);
          } catch (error) {
            console.error('Error creating letter:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.put('/api/letters/:id', async (req, res) => {
          try {
            const { id } = req.params;
            const updatedLetter = req.body;
            delete updatedLetter.id;
            delete updatedLetter.address; // Don't save address, it's joined

            const numUpdated = await knex('letters').where({ id }).update(updatedLetter);
            if (numUpdated === 0) return res.status(404).json({ error: 'Letter not found' });

            const letter = await knex('letters').where({ id }).first();
            res.json(letter);
          } catch (error) {
            console.error('Error updating letter:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.delete('/api/letters/:id', async (req, res) => {
          try {
            const { id } = req.params;
            await knex('letters').where({ id }).delete();
            res.json({ message: 'Letter deleted successfully' });
          } catch (error) {
            console.error('Error deleting letter:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        // --- Letter Templates ---
        app.get('/api/letter-templates', async (req, res) => {
          try {
            const templates = await knex('letter_templates').select('*');
            res.json(templates);
          } catch (error) {
            console.error('Error fetching letter templates:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.post('/api/letter-templates', async (req, res) => {
          try {
            const newTemplate = req.body;
            const [id] = await knex('letter_templates').insert(newTemplate);
            const template = await knex('letter_templates').where({ id }).first();
            res.json(template);
          } catch (error) {
            console.error('Error creating letter template:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.put('/api/letter-templates/:id', async (req, res) => {
          try {
            const { id } = req.params;
            const updatedTemplate = req.body;
            delete updatedTemplate.id;

            const numUpdated = await knex('letter_templates').where({ id }).update(updatedTemplate);
            if (numUpdated === 0) return res.status(404).json({ error: 'Template not found' });

            const template = await knex('letter_templates').where({ id }).first();
            res.json(template);
          } catch (error) {
            console.error('Error updating letter template:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });

        app.delete('/api/letter-templates/:id', async (req, res) => {
          try {
            const { id } = req.params;
            await knex('letter_templates').where({ id }).delete();
            res.json({ message: 'Template deleted successfully' });
          } catch (error) {
            console.error('Error deleting letter template:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
      }
    });
  }
});

app.get('/api/visits', async (req, res) => {
  try {
    const visits = await knex('visits').select('*').orderBy('date', 'desc');
    res.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/visits', async (req, res) => {
  try {
    const newVisit = req.body;
    const [id] = await knex('visits').insert(newVisit);
    const visit = await knex('visits').where({ id }).first();
    res.json(visit);
  } catch (error) {
    console.error('Error creating visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/visits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVisit = req.body;
    delete updatedVisit.id;

    const numUpdated = await knex('visits').where({ id }).update(updatedVisit);

    if (numUpdated === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visit = await knex('visits').where({ id }).first();
    res.json(visit);
  } catch (error) {
    console.error('Error updating visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/visits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const numDeleted = await knex('visits').where({ id }).delete();

    if (numDeleted === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/studies', async (req, res) => {
  try {
    const studies = await knex('studies').select('*');
    res.json(studies);
  } catch (error) {
    console.error('Error fetching studies:', error);
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
