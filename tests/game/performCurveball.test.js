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
  const loseAllBudgetCurveballPerform = staticCurveballs[2];

  test('should decrease budget and poll of game', async () => {
    const { poll, budget } = await performCurveball({
      gameId,
      curveballId: negativeCurveballToPerform.id,
    });

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

    expect(poll).toBe(dummyGame.poll + positiveCurveballToPerform.poll_change);
    expect(budget).toBe(
      dummyGame.budget + positiveCurveballToPerform.budget_change,
    );
  });

  test('should log', async () => {
    await performCurveball({
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
  });

  test('should lose all budget', async () => {
    const { budget } = await performCurveball({
      gameId,
      curveballId: loseAllBudgetCurveballPerform.id,
    });

    expect(budget).toBe(0);
  });
});
