const db = require('../../src/models/db');
const resetGameTables = require('../resetGameTables');
const { startSimulation } = require('../../src/models/game');
const {
  dummyGame,
  dummyGameMitigations,
  dummyGameInjections,
} = require('../testData');
const GameStates = require('../../src/constants/GameStates');

describe('Start Stimulation', () => {
  beforeEach(async () => {
    await resetGameTables();
    await db('game').insert(dummyGame);
    await db('game_mitigation').insert(dummyGameMitigations);
    await db('game_injection').insert(dummyGameInjections);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const gameId = dummyGame.id;

  test('should change game start time, state and started_at', async () => {
    const game = await startSimulation(gameId);

    expect(game.paused).toBe(false);
    expect(game.state).toBe(GameStates.SIMULATION);
    expect(game.started_at.getTime()).not.toBeNull();
  });

  test(`should prevent injections if game state was preparation`, async () => {
    await db('game_mitigation')
      .where({ game_id: gameId })
      .update({ state: true, preparation: true });
    await startSimulation(gameId);

    const gameInjections = await db('game_injection').select('id').where({
      game_id: gameId,
      prevented: true,
    });

    expect(gameInjections.length).toBeTruthy();
  });

  test(`should log simulation started`, async () => {
    await startSimulation(gameId);

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Game State Changed',
        description: 'Simulation Started',
      })
      .first();

    expect(gameLog).toBeTruthy();
  });

  test(`should log game timer started`, async () => {
    await db('game')
      .where({ id: gameId })
      .update({ state: GameStates.SIMULATION, paused: true });
    await startSimulation(gameId);

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Game State Changed',
        description: 'Timer Started',
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
