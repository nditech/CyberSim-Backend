const pino = require('pino');

const config = require('./config');

module.exports = pino({
  enabled: config.environment !== 'test',
});
