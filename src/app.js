const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const expressPino = require('express-pino-logger');

const logger = require('./logger');
const db = require('./models/db');
const { getResponses } = require('./models/response');
const { getInjections } = require('./models/injection');

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
  const records = await getInjections();
  res.json(records);
});

app.get('/responses', async (req, res) => {
  const records = await getResponses();
  res.json(records);
});

app.get('/actions', async (req, res) => {
  const records = await db('action');
  res.json(records);
});

module.exports = app;
