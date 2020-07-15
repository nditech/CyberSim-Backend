const db = require('../models/db');

const setUpDatabase = async () => {
  await db.migrate.down();
  await db.migrate.up();
  await db.seed.run();
};

module.exports = {
  setUpDatabase,
};
