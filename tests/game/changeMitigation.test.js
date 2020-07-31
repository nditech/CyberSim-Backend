const db = require('../../src/models/db');
const resetGameTables = require('../resetGameTables');
const { changeMitigation } = require('../../src/models/game');
const {
  dummyGame,
  dummyGameMitigations,
  dummyGameInjections,
} = require('../testData');
const GameStates = require('../../src/constants/GameStates');

describe('Change Mitigation', () => {
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

  test('should change mitigation state', async () => {
    const {
      mitigation_id: mitigationId,
      state,
      location,
      id,
    } = dummyGameMitigations[0];

    const { mitigations } = await changeMitigation({
      mitigationId,
      mitigationType: location,
      mitigationValue: !state,
      gameId,
    });

    const changedMitigation = mitigations.find(
      (mitigation) => mitigation.id === id,
    );

    expect(changedMitigation.state).toBe(!state);
  });

  test('should reduce game budget by mitigation cost', async () => {
    const { budget } = await db('game')
      .select('budget')
      .where({ id: gameId })
      .first();

    const {
      mitigation_id: mitigationId,
      state,
      location,
    } = dummyGameMitigations[0];

    const { cost } = await db('mitigation')
      .select(`${location}_cost as cost`)
      .where({ id: mitigationId })
      .first();

    const { budget: newBudget } = await changeMitigation({
      mitigationId,
      mitigationType: location,
      mitigationValue: !state,
      gameId,
    });

    expect(newBudget).toBe(budget - cost);
  });

  test('should not reduce game budget if mitigation value is false', async () => {
    const { budget } = await db('game')
      .select('budget')
      .where({ id: gameId })
      .first();

    const { mitigation_id: mitigationId, location } = dummyGameMitigations[0];

    const { budget: newBudget } = await changeMitigation({
      mitigationId,
      mitigationType: location,
      mitigationValue: false,
      gameId,
    });

    expect(budget).toBe(newBudget);
  });

  test(`should skip injections if game state is not ${GameStates.PREPARATION}`, async () => {
    await db('game')
      .where({ id: gameId })
      .update({ state: GameStates.SIMULATION });

    const {
      mitigation_id: mitigationId,
      location,
      state,
    } = dummyGameMitigations[0];

    await changeMitigation({
      mitigationId,
      mitigationType: location,
      mitigationValue: !state,
      gameId,
    });

    const gameInjection = await db('game_injection')
      .where({
        game_id: gameId,
        injection_id: 'I1',
        prevented: true,
      })
      .first();

    expect(gameInjection).toBeTruthy();
  });

  test(`should log if game state is not ${GameStates.PREPARATION}`, async () => {
    await db('game')
      .where({ id: gameId })
      .update({ state: GameStates.SIMULATION });

    const {
      mitigation_id: mitigationId,
      location,
      state,
    } = dummyGameMitigations[0];

    await changeMitigation({
      mitigationId,
      mitigationType: location,
      mitigationValue: !state,
      gameId,
    });

    const gameLog = await db('game_log')
      .where({
        game_id: gameId,
        type: 'Budget Item Purchase',
        mitigation_id: mitigationId,
        mitigation_type: location,
      })
      .first();

    expect(gameLog).toBeTruthy();
  });

  test('should throw if game budget < mitigation cost', async () => {
    await db('game').where({ id: gameId }).update({ budget: 0 });

    const {
      mitigation_id: mitigationId,
      state,
      location,
    } = dummyGameMitigations[0];

    await expect(
      changeMitigation({
        mitigationId,
        mitigationType: location,
        mitigationValue: !state,
        gameId,
      }),
    ).rejects.toThrowError(/Not enough budget/);
  });
});
