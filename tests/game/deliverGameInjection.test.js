const db = require('../../src/models/db');
const resetTables = require('../resetTables');
const { deliverGameInjection } = require('../../src/models/game');
const { dumyGame, dumyInjections, dumyGameSystems } = require('../testData');

describe('Pause Simulation Function', () => {
  beforeAll(async () => {
    await resetTables();
    await db('game').insert(dumyGame);
    await db('game_injection').insert(dumyInjections);
    await db('game_system').insert(dumyGameSystems);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dumyGame.id;
  const injection = dumyInjections.find((inj) => inj.injection_id === 'I11');

  test('should disable systems affacted by injection', async () => {
    const { systems_to_disable: affactedSystems } = await db('injection')
      .where({ id: injection.injection_id })
      .first();

    const { systems } = await deliverGameInjection({
      gameId,
      injectionId: injection.injection_id,
    });

    expect(
      affactedSystems.every(
        (sys) => !systems.find((gameSys) => gameSys.system_id === sys).state,
      ),
    ).toBe(true);
  });

  test('should change game poll', async () => {
    const { poll_change: pollChange } = await db('injection')
      .where({ id: injection.injection_id })
      .first();

    const { poll: pollBefore } = await db('game').where({ id: gameId }).first();

    const { poll: pollAfter } = await deliverGameInjection({
      gameId,
      injectionId: injection.injection_id,
    });

    expect(pollAfter).toBe(Math.max(0, pollBefore + pollChange));
  });

  test('should set game delivered property to true', async () => {
    await deliverGameInjection({
      gameId,
      injectionId: injection.injection_id,
    });

    const { delivered } = await db('game_injection')
      .where({
        injection_id: injection.injection_id,
      })
      .first();

    expect(delivered).toBe(true);
  });
});
