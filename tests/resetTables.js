const db = require('../src/models/db');

module.exports = async () => {
  await db('game_injection').del();
  await db('game_system').del();
  await db('game_mitigation').del();
  await db('game_log').del();
  await db('game').del();
};
