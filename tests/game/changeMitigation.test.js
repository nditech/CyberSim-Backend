const db = require('../../src/models/db');
const resetTables = require('../resetTables');
const { changeMitigation } = require('../../src/models/game');
const { dumyGame, dumyGameMitigations } = require('../testData');
const GameStates = require('../../src/constants/GameStates');

describe('Change Mitigation Function', () => {
  beforeEach(async () => {
    await resetTables();
    await db('game').insert(dumyGame);
    await db('game_mitigation').insert(dumyGameMitigations);
  });

  afterAll(() => db.destroy());

  const gameId = dumyGame.id;

  test('should change mitigation state', async () => {
    const {
      mitigation_id: mitigationId,
      state,
      location,
      id,
    } = dumyGameMitigations[0];

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
      .where({ 'game.id': gameId })
      .first();

    const {
      mitigation_id: mitigationId,
      state,
      location,
    } = dumyGameMitigations[0];

    const [{ cost }] = await db('mitigation')
      .select(`${location}_cost as cost`)
      .where({ id: mitigationId });

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
      .where({ 'game.id': gameId })
      .first();

    const { mitigation_id: mitigationId, location } = dumyGameMitigations[0];

    const { budget: newBudget } = await changeMitigation({
      mitigationId,
      mitigationType: location,
      mitigationValue: false,
      gameId,
    });

    expect(budget).toBe(newBudget);
  });

  test(`should log if game state is not ${GameStates.PREPARATION}`, async () => {
    await db('game')
      .where({ 'game.id': gameId })
      .update({ state: GameStates.SIMULATION });

    const {
      mitigation_id: mitigationId,
      location,
      state,
    } = dumyGameMitigations[0];

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
    } = dumyGameMitigations[0];

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
