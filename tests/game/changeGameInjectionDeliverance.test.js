const db = require('../../src/models/db');
const resetTables = require('../resetTables');
const { changeGameInjectionDeliverance } = require('../../src/models/game');
const { dumyGame, dumyInjections } = require('../testData');

describe('Pause Simulation Function', () => {
  beforeAll(async () => {
    await resetTables();
    await db('game').insert(dumyGame);
    await db('game_injection').insert(dumyInjections);
  });

  afterAll(() => db.destroy());

  const gameId = dumyGame.id;
  const injectionId = dumyInjections[0].injection_id;

  test('should change delivered property', async () => {
    await changeGameInjectionDeliverance({
      gameId,
      injectionId,
      delivered: true,
    });

    const injection = await db('game_injection')
      .where({
        game_id: gameId,
        injection_id: injectionId,
      })
      .first();

    expect(injection.delivered).toBe(true);
  });
});
