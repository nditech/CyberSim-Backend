const db = require('../src/models/db');

module.exports = async () => {
  await db.migrate.down();
  await db.migrate.up();
  await db.seed.run();
  await db.destroy();
};
