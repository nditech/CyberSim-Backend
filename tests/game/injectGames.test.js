const db = require('../../src/models/db');
const { injectGames } = require('../../src/models/game');
const resetTables = require('../resetTables');
const { dumyGame, dumyGameMitigations } = require('../testData');
const GameStates = require('../../src/constants/GameStates');

describe('Inject Games Function', () => {
  const dumyGame1 = { ...dumyGame, ...{ id: `${dumyGame.id}1` } };
  dumyGame.started_at = new Date(Date.now() - 1000 * 60 * 2);
  dumyGame1.started_at = new Date(Date.now() - 1000 * 60 * 2);
  dumyGame.state = GameStates.SIMULATION;
  dumyGame1.state = GameStates.SIMULATION;
  dumyGame.paused = false;
  dumyGame1.paused = false;

  beforeEach(async () => {
    await resetTables();
    await db('game').insert(dumyGame);
    await db('game').insert(dumyGame1);
    await db('game_mitigation').insert(dumyGameMitigations);
    await db('game_mitigation').insert(
      dumyGameMitigations.map((mitigation, i) => ({
        ...mitigation,
        ...{ game_id: dumyGame1.id, id: dumyGameMitigations.length + i + 1 },
      })),
    );
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  test('should inject if skipper mitigation is down', async () => {
    const games = await injectGames();
    games.forEach((game) => {
      expect(game.injections).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            injection_id: 'I1',
            game_id: game.id,
            delivered: false,
          }),
          expect.objectContaining({
            injection_id: 'I2',
            game_id: game.id,
            delivered: false,
          }),
        ]),
      );
    });
  });

  test('should not inject if skipper mitigation is up', async () => {
    await db('game_mitigation')
      .where({ mitigation_id: 'M14', location: 'hq' })
      .update({ state: true });

    await db('game')
      .whereIn('id', [dumyGame.id, dumyGame1.id])
      .update({ started_at: new Date(Date.now() - 630000) });

    const games = await injectGames();
    games.forEach((game) => {
      expect(game.prevented_injections).toEqual(expect.arrayContaining(['I8']));
    });
  });

  test('should set every_injection_checked', async () => {
    await db('game')
      .whereIn('id', [dumyGame.id, dumyGame1.id])
      .update({ started_at: new Date(Date.now() - 4920000) });

    const games = await injectGames();
    games.forEach((game) => {
      expect(game.every_injection_checked).toBe(true);
    });
  });
});
