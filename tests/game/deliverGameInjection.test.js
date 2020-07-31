const db = require('../../src/models/db');
const resetGameTables = require('../resetGameTables');
const { deliverGameInjection } = require('../../src/models/game');
const {
  dummyGame,
  dummyGameInjections,
  dummyGameSystems,
} = require('../testData');

dummyGame.started_at = db.fn.now();
dummyGame.paused = false;

describe('Deliver Game Injection', () => {
  beforeAll(async () => {
    await resetGameTables();
    await db('game').insert(dummyGame);
    await db('game_injection').insert(dummyGameInjections);
    await db('game_system').insert(dummyGameSystems);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dummyGame.id;
  const injection = dummyGameInjections.find(
    (inj) => inj.injection_id === 'I1',
  );

  test('should disable systems affacted by injection', async () => {
    const { affactedSystems } = await db('injection')
      .select('systems_to_disable as affactedSystems')
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
    const { pollChange } = await db('injection')
      .select('poll_change as pollChange')
      .where({ id: injection.injection_id })
      .first();

    const { pollBefore } = await db('game')
      .select('poll as pollBefore')
      .where({ id: gameId })
      .first();

    const { poll: pollAfter } = await deliverGameInjection({
      gameId,
      injectionId: injection.injection_id,
    });

    expect(pollAfter).toBe(Math.max(0, pollBefore + pollChange));
  });

  test('should set game delivered and delivered_at property', async () => {
    const { startedAt } = await db('game')
      .select('started_at as startedAt')
      .where({ id: gameId })
      .first();
    const dateBeforeTest = Date.now() - new Date(startedAt).getTime();
    await deliverGameInjection({
      gameId,
      injectionId: injection.injection_id,
    });
    const dateAfterTest = Date.now() - new Date(startedAt).getTime();

    const { delivered, delivered_at: deliveredAt } = await db('game_injection')
      .where({
        injection_id: injection.injection_id,
      })
      .first();
    expect(delivered).toBe(true);
    expect(deliveredAt).toBeGreaterThan(dateBeforeTest);
    expect(deliveredAt).toBeLessThan(dateAfterTest);
  });
});
