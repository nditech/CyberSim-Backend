const { setUpDatabase } = require('../setUp');
const { startSimulation } = require('../../models/game');
const db = require('../../models/db');
const { dumyGame, dumyGameMitigations } = require('../testData');
const GameStates = require('../../constants/GameStates');

describe('Start Stimulation Function', () => {
  beforeEach(async () => {
    await setUpDatabase();
    await db('game').insert(dumyGame);
    await db('game_mitigation').insert(dumyGameMitigations);
  });

  const gameId = dumyGame.id;

  test('should change game start time and state', async () => {
    const { game } = await startSimulation(gameId);

    expect(game).toMatchObject();
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
