const { getInjections } = require('../src/models/injection');
const { staticInjections } = require('./testData');

describe('Get Injections Function', () => {
  test('injection table should return with responses', async () => {
    const injectionsFromDb = await getInjections();
    expect(injectionsFromDb).toMatchObject(staticInjections);
  });
});
