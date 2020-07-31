const db = require('../../src/models/db');
const { getResponsesById } = require('../../src/models/response');
const resetGameTables = require('../resetGameTables');
const GameStates = require('../../src/constants/GameStates');
const { makeResponses } = require('../../src/models/game');
const {
  dummyGame,
  dummyGameMitigations,
  dummyGameSystems,
  dummyGameInjections,
} = require('../testData');

describe('Make Responses', () => {
  dummyGame.state = GameStates.SIMULATION;

  beforeEach(async () => {
    await resetGameTables();
    await db('game').insert(dummyGame);
    await db('game_mitigation').insert(dummyGameMitigations);
    await db('game_system').insert(dummyGameSystems);
    await db('game_injection').insert(dummyGameInjections);
  });

  afterAll(async (done) => {
    await db.destroy();
    done();
  });

  test('should throw if required mitigation is down', async () => {
    await expect(
      makeResponses({
        responseIds: ['RP1'],
        gameId: dummyGame.id,
        injectionId: 'I1',
      }),
    ).rejects.toThrow(/Response not allowed/);
  });

  test('should throw if budget is not enough', async () => {
    await db('game').where({ id: dummyGame.id }).update({ budget: 0 });

    await expect(
      makeResponses({
        responseIds: ['RP2'],
        gameId: dummyGame.id,
        injectionId: 'I2',
      }),
    ).rejects.toThrow(/Not enough budget/);
  });

  test('should reduce budget by cost', async () => {
    const { budget: oldBudget } = await db('game')
      .select('budget')
      .where({ id: dummyGame.id })
      .first();

    const [{ cost: responseCost }] = await getResponsesById(['RP2']);

    const { budget: newBudget } = await makeResponses({
      responseIds: ['RP2'],
      gameId: dummyGame.id,
      injectionId: 'I2',
    });

    expect(newBudget).toBe(oldBudget - responseCost);
  });

  test('should set game mitigation state true', async () => {
    const { mitigationType, mitigationId } = await db('response')
      .select(
        'mitigation_type as mitigationType',
        'mitigation_id as mitigationId',
      )
      .where({ id: 'RP2' })
      .first();

    const { mitigations } = await makeResponses({
      responseIds: ['RP2'],
      gameId: dummyGame.id,
      injectionId: 'I2',
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
    const { systemsToRestore } = await db('response')
      .select('systems_to_restore as systemsToRestore')
      .where({ id: 'RP1' })
      .first();

    await db('game_mitigation')
      .where({ game_id: dummyGame.id, mitigation_id: 'M1', location: 'local' })
      .update({ state: true });

    await db('game_system')
      .whereIn('system_id', systemsToRestore)
      .update({ state: false });

    const { systems } = await makeResponses({
      responseIds: ['RP1'],
      gameId: dummyGame.id,
      injectionId: 'I1',
    });

    systems.forEach((system) => {
      expect(system.state).toBe(true);
    });
  });

  test('should update prevented injections based on response', async () => {
    const { injection_to_prevent: injectionToPrevent } = await db(
      'injection_response',
    )
      .where({ response_id: 'RP1', injection_id: 'I1' })
      .first();

    await db('game_mitigation')
      .where({ game_id: dummyGame.id, mitigation_id: 'M1', location: 'local' })
      .update({ state: true });

    await makeResponses({
      responseIds: ['RP1'],
      gameId: dummyGame.id,
      injectionId: 'I1',
    });

    const preventedInjection = await db('game_injection')
      .select('id')
      .where({
        prevented: true,
        game_id: dummyGame.id,
        injection_id: injectionToPrevent,
      })
      .first();

    expect(preventedInjection).toBeTruthy();
  });

  test('should update prevented injections based on mitigations added', async () => {
    await makeResponses({
      responseIds: ['RP2'],
      gameId: dummyGame.id,
      injectionId: 'I2',
    });

    const preventedInjection = await db('game_injection')
      .select('id')
      .where({
        prevented: true,
        game_id: dummyGame.id,
        injection_id: 'I3',
      })
      .first();

    expect(preventedInjection).toBeTruthy();
  });

  test('should update game_injection table with response', async () => {
    const { injections } = await makeResponses({
      responseIds: ['RP2'],
      gameId: dummyGame.id,
      injectionId: 'I2',
    });

    expect(
      injections.find(
        (injection) =>
          injection.injection_id === 'I2' && injection.game_id === dummyGame.id,
      ),
    ).toMatchObject({
      correct_responses_made: ['RP2'],
    });
  });

  test('should log on system restore action', async () => {
    await db('game_mitigation')
      .where({ game_id: dummyGame.id, mitigation_id: 'M1', location: 'local' })
      .update({ state: true });

    await makeResponses({
      responseIds: ['RP1'],
      gameId: dummyGame.id,
    });

    const gameLog = await db('game_log')
      .where({
        game_id: dummyGame.id,
        type: 'System Restore Action',
        response_id: 'RP1',
      })
      .first();

    expect(gameLog).toBeTruthy();
  });
});
