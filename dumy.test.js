const db = require('./src/models/db');

test('this is a dumy test', async (done) => {
  await db.raw('SELECT 1;');
  expect(1).toBe(1);
  db.destroy();
  done();
});
