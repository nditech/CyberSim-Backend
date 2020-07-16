const { setUpDatabase } = require('../setUp');
const db = require('../../models/db');
const { pauseSimulation } = require('../../models/game');
const { dumyGame } = require('../testData');
const GameStates = require('../../constants/GameStates');

describe('Pause Simulation Function', () => {
  beforeAll(async () => {
    await setUpDatabase();
    dumyGame.started_at = db.fn.now();
    dumyGame.state = GameStates.SIMULATION;
    await db('game').insert(dumyGame);
  });

  afterAll(() => db.destroy());

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
