const { setUpDatabase } = require('../setUp');
const { createGame } = require('../../models/game');
const db = require('../../models/db');
const {
  dumyGame,
  dumyGameMitigations,
  dumyGameSystems,
} = require('../testData');

describe('Create Game Function', () => {
  beforeAll(() => setUpDatabase());

  afterAll(() => db.destroy());

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
