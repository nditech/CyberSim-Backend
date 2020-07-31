const db = require('../src/models/db');
const { getInjections } = require('../src/models/injection');
const { staticInjections } = require('./testData');

describe('Get Injections', () => {
  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  test('injection table should return with responses', async () => {
    const injectionsFromDb = await getInjections();
    expect(injectionsFromDb).toMatchObject(staticInjections);
  });
});
