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

app.get('/api/territories', async (req, res) => {
  try {
    const territories = await knex('territories').select('*');
    res.json(territories);
  } catch (error) {
    console.error('Error fetching territories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
