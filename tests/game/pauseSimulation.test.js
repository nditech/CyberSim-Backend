const db = require('../../src/models/db');
const resetGameTables = require('../resetGameTables');
const { pauseSimulation } = require('../../src/models/game');
const { dummyGame } = require('../testData');
const GameStates = require('../../src/constants/GameStates');

const sleep = (m) => new Promise((r) => setTimeout(r, m));

dummyGame.started_at = db.fn.now();
dummyGame.state = GameStates.SIMULATION;
dummyGame.paused = false;

describe('Pause Simulation', () => {
  beforeAll(async () => {
    await resetGameTables();
    await db('game').insert(dummyGame);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dummyGame.id;

  test('should change game state state', async () => {
    await sleep(500);
    const {
      state,
      paused,
      millis_taken_before_started: millisTakenBeforeStarted,
    } = await pauseSimulation({ gameId });

    expect(state).toBe(GameStates.SIMULATION);
    expect(paused).toBe(true);
    expect(millisTakenBeforeStarted).toBeGreaterThan(0);
  });

  test('should log', async () => {
    const { millis_taken_before_started: millisTakenBeforeStarted } =
      await pauseSimulation({ gameId });

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Game State Changed',
        description: 'Timer Stopped',
        game_timer: millisTakenBeforeStarted,
      })
      .first();

    expect(gameLog).toBeTruthy();
  });
});
