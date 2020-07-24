const db = require('../src/models/db');

module.exports = async () => {
  await db.migrate.rollback({}, true);
  await db.migrate.latest();
  await db.seed.run();
  await db.destroy();
};
