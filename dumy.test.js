const db = require('./src/models/db');

test('this is a dumy test', async () => {
  await db.raw('SELECT 1;');
  expect(1).toBe(1);
});
