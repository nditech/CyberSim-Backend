const { setUpDatabase } = require('./setUp');
const { getInjections } = require('../models/injection');
const { staticInjections } = require('./testData');
const db = require('../models/db');

describe('Get Injections Function', () => {
  beforeAll(() => setUpDatabase());

  test('injection table should return with responses', async () => {
    const injectionsFromDb = await getInjections();
    expect(injectionsFromDb).toMatchObject(staticInjections);
  });

  afterAll(() => db.destroy());
});
