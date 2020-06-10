const helmet = require('helmet');
const express = require('express');
const expressPino = require('express-pino-logger');

const logger = require('./logger');
const db = require('./models/db');

const app = express();

app.use(helmet());
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

app.get('/games', async (req, res) => {
  const records = await db('game');
  res.json({ records });
});

app.get('/mitigations', async (req, res) => {
  const records = await db('mitigation');
  res.json({ records });
});

module.exports = app;
