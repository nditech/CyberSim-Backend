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

  beforeAll(async () => {
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

  test('should set every_injection_checked and prevented_injections filds', async () => {
    const games = await injectGames();
    console.log(games);
  });
});
