const db = require('../../src/models/db');
const { createGame } = require('../../src/models/game');
const resetTables = require('../resetTables');
const {
  dumyGame,
  dumyGameMitigations,
  dumyGameSystems,
} = require('../testData');

describe('Create Game Function', () => {
  beforeAll(async () => {
    await resetTables();
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const { id: gameId } = dumyGame;

  test('should create required game tables', async () => {
    const game = await createGame(gameId);
    expect(game).toMatchObject(dumyGame);
    expect(game.mitigations).toMatchObject(dumyGameMitigations);
    expect(game.systems).toMatchObject(dumyGameSystems);
    expect(game.injections).toBeNull();
    expect(game.logs).toBeNull();
  });

  test('should throw error on already existing game name', async () => {
    await expect(createGame(gameId)).rejects.toThrow();
  });
});
