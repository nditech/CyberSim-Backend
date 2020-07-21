const { getActions } = require('../src/models/action');
const { staticActions } = require('./testData');

describe('Get Actions Function', () => {
  test('action table should return with role names', async () => {
    const actionsFromDb = await getActions();
    expect(actionsFromDb).toMatchObject(staticActions);
  });
});
