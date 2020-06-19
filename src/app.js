const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const expressPino = require('express-pino-logger');

const logger = require('./logger');
const db = require('./models/db');

const app = express();

app.use(helmet());
app.use(cors());
app.use(
  expressPino({
    logger,
  }),
);

app.get('/', async (req, res) => {
  try {
    await db.raw('SELECT 1;');
  } catch (_) {
    res.status(500);
    res.send({ status: 'not ok' });
    return;
  }
  res.status(200);
  res.send({
    status: 'ok',
  });
});

// STATIC DB data are expose via REST api

app.get('/mitigations', async (req, res) => {
  const records = await db('mitigation');
  res.json(records);
});

app.get('/systems', async (req, res) => {
  const records = await db('system');
  res.json(records);
});

app.get('/injections', async (req, res) => {
  const records = await db('injection');
  res.json(records);
});

app.get('/responses', async (req, res) => {
  const records = await db('response')
    .select(
      'response.*',
      'mitigation.hq_cost as hqMitCost',
      'mitigation.local_cost as localMitCost',
    )
    .leftOuterJoin('mitigation', 'response.mitigation_id', 'mitigation.id');
  res.json(records.map(({ hqMitCost, localMitCost, ...response }) => {
    if (response.cost !== null) {
      return response;
    }
    switch (response.location) {
      case 'local':
        return { ...response, cost: localMitCost || 0 };
      case 'hq':
        return { ...response, cost: hqMitCost || 0 };
      default:
        return { ...response, cost: (hqMitCost || 0) + (localMitCost || 0) };
    }
  }));
});

module.exports = app;
