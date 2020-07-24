const db = require('../../src/models/db');
const { performCurveball } = require('../../src/models/game');
const { dumyGame, staticCurveballs } = require('../testData');
const resetGameTables = require('../resetGameTables');

describe('Perform Curveball Function', () => {
  beforeEach(async () => {
    await resetGameTables();
    await db('game').insert(dumyGame);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dumyGame.id;
  const curveballToPerform = staticCurveballs[0];

  test('should change budget and poll of game', async () => {
    const { poll, budget } = await performCurveball({
      gameId,
      curveballId: curveballToPerform.id,
    });

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Curveball Event',
        curveball_id: curveballToPerform.id,
      })
      .first();

    expect(gameLog).toBeTruthy();
    expect(poll).toBe(dumyGame.poll - curveballToPerform.poll_decrease);
    expect(poll).toBeGreaterThanOrEqual(0);
    expect(budget).toBe(dumyGame.budget - curveballToPerform.budget_decrease);
  });
});
