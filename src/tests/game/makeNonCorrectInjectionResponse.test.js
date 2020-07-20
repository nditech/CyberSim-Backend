const { setUpDatabase } = require('../setUp');
const db = require('../../models/db');
const { makeNonCorrectInjectionResponse } = require('../../models/game');
const { dumyGame, dumyInjections } = require('../testData');

describe('Pause Simulation Function', () => {
  beforeAll(async () => {
    await setUpDatabase();
    dumyGame.started_at = db.fn.now();
    dumyGame.paused = false;
    await db('game').insert(dumyGame);
    await db('game_injection').insert(dumyInjections);
  });

  afterAll(() => db.destroy());

  const gameId = dumyGame.id;
  const injectionId = dumyInjections[0].injection_id;

  test('should set delivered and response time', async () => {
    const { started_at: startedAt } = await db('game')
      .where({ id: gameId })
      .first();
    const dateBeforeTest = Date.now() - new Date(startedAt).getTime();
    await makeNonCorrectInjectionResponse({ gameId, injectionId });
    const dateAfterTest = Date.now() - new Date(startedAt).getTime();

    const { delivered, response_made_at: responseMadeAt } = await db(
      'game_injection',
    )
      .where({
        game_id: gameId,
        injection_id: injectionId,
      })
      .first();

    expect(delivered).toBe(true);
    expect(responseMadeAt).toBeGreaterThan(dateBeforeTest);
    expect(responseMadeAt).toBeLessThan(dateAfterTest);
  });
});
