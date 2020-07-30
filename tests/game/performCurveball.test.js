const db = require('../../src/models/db');
const { performCurveball } = require('../../src/models/game');
const { dummyGame, staticCurveballs } = require('../testData');
const resetGameTables = require('../resetGameTables');

describe('Perform Curveball', () => {
  beforeEach(async () => {
    await resetGameTables();
    await db('game').insert(dummyGame);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dummyGame.id;
  const negativeCurveballToPerform = staticCurveballs[0];
  const positiveCurveballToPerform = staticCurveballs[1];

  test('should decrease budget and poll of game', async () => {
    const { poll, budget } = await performCurveball({
      gameId,
      curveballId: negativeCurveballToPerform.id,
    });

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Curveball Event',
        curveball_id: negativeCurveballToPerform.id,
      })
      .first();

    expect(gameLog).toBeTruthy();
    expect(poll).toBe(dummyGame.poll + negativeCurveballToPerform.poll_change);
    expect(budget).toBe(
      dummyGame.budget + negativeCurveballToPerform.budget_change,
    );
  });

  test('should increase budget and poll of game', async () => {
    const { poll, budget } = await performCurveball({
      gameId,
      curveballId: positiveCurveballToPerform.id,
    });

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Curveball Event',
        curveball_id: positiveCurveballToPerform.id,
      })
      .first();

    expect(gameLog).toBeTruthy();
    expect(poll).toBe(dummyGame.poll + positiveCurveballToPerform.poll_change);
    expect(budget).toBe(
      dummyGame.budget + positiveCurveballToPerform.budget_change,
    );
  });
});
