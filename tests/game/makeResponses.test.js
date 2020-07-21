const db = require('../../src/models/db');
const resetTables = require('../resetTables');
const GameStates = require('../../src/constants/GameStates');
const { makeResponses } = require('../../src/models/game');
const {
  dumyGame,
  dumyGameMitigations,
  dumyGameSystems,
} = require('../testData');

describe('Inject Games Function', () => {
  dumyGame.state = GameStates.SIMULATION;

  beforeEach(async () => {
    await resetTables();
    await db('game').insert(dumyGame);
    await db('game_mitigation').insert(dumyGameMitigations);
    await db('game_system').insert(dumyGameSystems);
  });

  afterAll(() => db.destroy());

  test('should throw if required mitigation is down', async () => {
    await expect(
      makeResponses({
        responseIds: ['RP13'],
        gameId: dumyGame.id,
        injectionId: 'I25',
      }),
    ).rejects.toThrow(/Response not allowed/);
  });

  test('should throw if budget is not enough', async () => {
    await db('game').where({ id: dumyGame.id }).update({ budget: 0 });

    await expect(
      makeResponses({
        responseIds: ['RP6'],
        gameId: dumyGame.id,
        injectionId: 'I11',
      }),
    ).rejects.toThrow(/Not enough budget/);
  });

  test('should reduce budget by cost', async () => {
    const { budget: oldBudget } = await db('game')
      .where({ id: dumyGame.id })
      .first();

    const { cost: responseCost } = await db('response')
      .where({ id: 'RP6' })
      .first();

    const { budget: newBudget } = await makeResponses({
      responseIds: ['RP6'],
      gameId: dumyGame.id,
      injectionId: 'I11',
    });

    expect(newBudget).toBe(oldBudget - responseCost);
  });

  test('should set game mitigation state true', async () => {
    const {
      mitigation_type: mitigationType,
      mitigation_id: mitigationId,
    } = await db('response').where({ id: 'RP8' }).first();

    const { mitigations } = await makeResponses({
      responseIds: ['RP8'],
      gameId: dumyGame.id,
      injectionId: 'I14',
    });

    expect(
      mitigations.find(
        (mitigation) =>
          mitigation.mitigation_id === mitigationId &&
          mitigation.location === mitigationType,
      ).state,
    ).toBe(true);
  });

  test('should restore systems', async () => {
    const { systems_to_restore: systemsToRestore } = await db('response')
      .where({ id: 'RP17' })
      .first();

    await db('game_system')
      .whereIn('system_id', systemsToRestore)
      .update({ state: false });

    const { systems } = await makeResponses({
      responseIds: ['RP17'],
      gameId: dumyGame.id,
      injectionId: 'I36',
    });

    systems.forEach((system) => {
      expect(system.state).toBe(true);
    });
  });

  test('should update prevented injections', async () => {
    await db('game_injection').insert({
      injection_id: 'I1',
      game_id: dumyGame.id,
    });

    const { injection_to_prevent: injectionToPrevent } = await db(
      'injection_response',
    )
      .where({ response_id: 'RP1', injection_id: 'I1' })
      .first();

    const { prevented_injections: preventedInjections } = await makeResponses({
      responseIds: ['RP1'],
      gameId: dumyGame.id,
      injectionId: 'I1',
    });

    expect(preventedInjections).toEqual(
      expect.arrayContaining([injectionToPrevent]),
    );
  });

  test('should update game_injection table', async () => {
    await db('game_injection').insert({
      injection_id: 'I1',
      game_id: dumyGame.id,
    });

    const { injections } = await makeResponses({
      responseIds: ['RP1'],
      gameId: dumyGame.id,
      injectionId: 'I1',
    });

    expect(
      injections.find(
        (injection) =>
          injection.injection_id === 'I1' && injection.game_id === dumyGame.id,
      ),
    ).toMatchObject({
      delivered: true,
      correct_responses_made: ['RP1'],
    });
  });

  test('should log on system restore action', async () => {
    await db('game_injection').insert({
      injection_id: 'I1',
      game_id: dumyGame.id,
    });

    await makeResponses({
      responseIds: ['RP1'],
      gameId: dumyGame.id,
    });

    const gameLog = await db('game_log')
      .where({
        game_id: dumyGame.id,
        type: 'System Restore Action',
        response_id: 'RP1',
      })
      .first();

    expect(gameLog).toBeTruthy();
  });
});
