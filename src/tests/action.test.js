const { setUpDatabase } = require('./setUp');
const { getActions } = require('../models/action');
const { staticActions } = require('./testData');
const db = require('../models/db');

describe('Get Actions Function', () => {
  beforeAll(() => setUpDatabase());

  test('action table should return with role names', async () => {
    const actionsFromDb = await getActions();
    expect(actionsFromDb).toMatchObject(staticActions);
  });

  afterAll(() => db.destroy());
});
