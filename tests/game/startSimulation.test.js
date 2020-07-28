const db = require('../../src/models/db');
const resetGameTables = require('../resetGameTables');
const { startSimulation } = require('../../src/models/game');
const { dumyGame, dumyGameMitigations } = require('../testData');
const GameStates = require('../../src/constants/GameStates');

describe('Start Stimulation Function', () => {
  beforeEach(async () => {
    await resetGameTables();
    await db('game').insert(dumyGame);
    await db('game_mitigation').insert(dumyGameMitigations);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dumyGame.id;

  test('should change game start time, state and started_at', async () => {
    const game = await startSimulation(gameId);

    expect(game.paused).toBe(false);
    expect(game.state).toBe(GameStates.SIMULATION);
    expect(game.started_at.getTime()).not.toBeNull();
  });

  test(`should log`, async () => {
    await startSimulation(gameId);

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Game State Changed',
        descripition:
          dumyGame.state === GameStates.PREPARATION
            ? 'Simulation Started'
            : 'Timer Started',
      })
      .first();

    expect(gameLog).toBeTruthy();
  });

  test(`should throw if game state is ${GameStates.ASSESSMENT}`, async () => {
    await db('game')
      .where({ id: gameId })
      .update({ state: GameStates.ASSESSMENT });

    await expect(startSimulation(gameId)).rejects.toThrowError(
      /Cannot start finalized game/,
    );
  });
});
