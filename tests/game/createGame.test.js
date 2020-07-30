const db = require('../../src/models/db');
const { createGame } = require('../../src/models/game');
const resetGameTables = require('../resetGameTables');
const {
  dummyGame,
  dummyGameMitigations,
  dummyGameSystems,
  dummyGameInjections,
} = require('../testData');

describe('Create Game', () => {
  beforeEach(async () => {
    await resetGameTables();
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  const { id: gameId } = dummyGame;

  test('should create required game tables', async () => {
    const game = await createGame(gameId);
    expect(game).toMatchObject(dummyGame);
    expect(game.mitigations).toMatchObject(dummyGameMitigations);
    expect(game.systems).toMatchObject(dummyGameSystems);
    expect(game.injections).toMatchObject(dummyGameInjections);
    expect(game.logs).toBeNull();
  });

  test('should throw error on already existing game name', async () => {
    await db('game').insert(dummyGame);
    await expect(createGame(gameId)).rejects.toThrow();
  });
});
