const db = require('../../src/models/db');
const resetGameTables = require('../resetGameTables');
const { pauseSimulation } = require('../../src/models/game');
const { dumyGame } = require('../testData');
const GameStates = require('../../src/constants/GameStates');

dumyGame.started_at = db.fn.now();
dumyGame.state = GameStates.SIMULATION;

describe('Pause Simulation Function', () => {
  beforeAll(async () => {
    await resetGameTables();
    await db('game').insert(dumyGame);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dumyGame.id;

  test('should change game state state', async () => {
    const {
      state,
      paused,
      millis_taken_before_started: millisTakenBeforeStarted,
      started_at: startedAt,
    } = await pauseSimulation({ gameId });

    const newMillisTakenBeforeStarted =
      millisTakenBeforeStarted + (Date.now() - new Date(startedAt).getTime());

    expect(state).toBe(GameStates.SIMULATION);
    expect(paused).toBe(true);
    expect(millisTakenBeforeStarted).toBeLessThan(newMillisTakenBeforeStarted);
  });

  test('should log', async () => {
    const {
      millis_taken_before_started: millisTakenBeforeStarted,
    } = await pauseSimulation({ gameId });

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Game State Changed',
        descripition: 'Timer Stopped',
        game_timer: millisTakenBeforeStarted,
      })
      .first();

    expect(gameLog).toBeTruthy();
  });
});
