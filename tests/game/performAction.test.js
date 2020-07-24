const db = require('../../src/models/db');
const { performAction } = require('../../src/models/game');
const { dumyGame, dumyGameSystems, staticActions } = require('../testData');
const resetGameTables = require('../resetGameTables');

describe('Perform Action Function', () => {
  beforeEach(async () => {
    await resetGameTables();
    await db('game').insert(dumyGame);
    await db('game_system').insert(dumyGameSystems);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dumyGame.id;
  const actionToPerorm = staticActions[0];

  test('should change budget and poll of game', async () => {
    const { poll, budget } = await performAction({
      gameId,
      actionId: actionToPerorm.id,
    });

    expect(poll).toBe(dumyGame.poll + actionToPerorm.poll_increase);
    expect(poll).toBeGreaterThanOrEqual(0);
    expect(poll).toBeLessThanOrEqual(100);
    expect(budget).toBe(
      dumyGame.budget - actionToPerorm.cost + actionToPerorm.budget_increase,
    );
  });

  test('should throw if budget is less than cost', async () => {
    await db('game').where({ id: gameId }).update({ budget: 0 });

    await expect(
      performAction({ gameId, actionId: actionToPerorm.id }),
    ).rejects.toThrow();
  });

  test('should throw if a required system is not available', async () => {
    const requiredSystem = actionToPerorm.required_systems[0];

    await db('game_system')
      .where({ system_id: requiredSystem })
      .update({ state: false });

    await expect(
      performAction({ gameId, actionId: actionToPerorm.id }),
    ).rejects.toThrow();
  });
});
