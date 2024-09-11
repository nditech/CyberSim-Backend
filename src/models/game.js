const db = require('./db');
const { getResponsesById } = require('./response');
const logger = require('../logger');
const GameStates = require('../constants/GameStates');
const { getTimeTaken } = require('../util');

const getGame = (id) =>
  db('game')
    .select(
      'game.id',
      'game.state',
      'game.poll',
      'game.budget',
      'game.started_at',
      'game.paused',
      'game.millis_taken_before_started',
      'i.injections',
      'm.mitigations',
      's.systems',
      'l.logs',
    )
    .where({ 'game.id': id })
    .joinRaw(
      `LEFT JOIN (SELECT gm.game_id, array_agg(to_json(gm)) AS mitigations FROM game_mitigation gm GROUP BY gm.game_id) m ON m.game_id = game.id`,
    )
    .joinRaw(
      `LEFT JOIN (SELECT gs.game_id, array_agg(to_json(gs)) AS systems FROM game_system gs GROUP BY gs.game_id) s ON s.game_id = game.id`,
    )
    .joinRaw(
      `LEFT JOIN (SELECT gi.game_id, array_agg(to_json(gi)) AS injections FROM game_injection gi GROUP BY gi.game_id) i ON i.game_id = game.id`,
    )
    .joinRaw(
      `LEFT JOIN (SELECT gl.game_id, array_agg(to_json(gl)) AS logs FROM game_log gl GROUP BY gl.game_id) l ON l.game_id = game.id`,
    )
    .first();

const createGame = async (
  id,
  initialBudget = 6000,
  initialPollPercentage = 55,
) => {
  await db('game').insert(
    {
      id,
      budget: initialBudget,
      poll: initialPollPercentage,
    },
    ['id'],
  );

  const systems = await db('system').select('id as systemId');
  await db('game_system').insert(
    systems.map(({ systemId }) => ({
      game_id: id,
      system_id: systemId,
      state: true,
    })),
  );

  const mitigations = await db('mitigation').select('id as mitigationId');
  await db('game_mitigation').insert(
    mitigations.map(({ mitigationId }) => ({
      game_id: id,
      mitigation_id: mitigationId,
      state: false,
    })),
  );

  const injections = await db('injection').select('id as injecionId');
  await db('game_injection').insert(
    injections.map(({ injecionId }) => ({
      game_id: id,
      injection_id: injecionId,
    })),
  );
  return getGame(id);
};

const changeMitigation = async ({ mitigationId, mitigationValue, gameId }) => {
  try {
    const game = await db('game')
      .select(
        'budget',
        'state',
        'started_at as startedAt',
        'paused',
        'millis_taken_before_started as millisTakenBeforeStarted',
      )
      .where({ id: gameId })
      .first();

    const { gameMitigationValue, gameMitigationId } = await db(
      'game_mitigation',
    )
      .select(
        'game_mitigation.state as gameMitigationValue',
        'game_mitigation.id as gameMitigationId',
      )
      .where({
        game_id: gameId,
        mitigation_id: mitigationId,
      })
      .first();

    if (gameMitigationValue !== mitigationValue) {
      const { cost } = await db('mitigation')
        .select('cost')
        .where({ id: mitigationId })
        .first();
      if (cost) {
        if (mitigationValue && game.budget < cost) {
          throw new Error('Not enough budget');
        }
        await db('game')
          .where({ id: gameId })
          .update({
            budget: Math.max(
              0,
              mitigationValue ? game.budget - cost : game.budget + cost,
            ),
          });
      }
      await db('game_mitigation')
        .where({ id: gameMitigationId })
        .update({
          state: mitigationValue,
          ...(game.state === GameStates.PREPARATION
            ? { preparation: mitigationValue }
            : {}),
        });
      if (game.state !== GameStates.PREPARATION) {
        const timeTaken = getTimeTaken(game);
        await db('game_injection')
          .where({ game_id: gameId, delivered: false })
          .whereIn('injection_id', function findInjectionsToSkip() {
            this.select('id').from('injection').where({
              skipper_mitigation: mitigationId,
            });
          })
          .update({ prevented: true, prevented_at: timeTaken });
        await db('game_log').insert({
          game_id: gameId,
          game_timer: timeTaken,
          type: 'Budget Item Purchase',
          mitigation_id: mitigationId,
        });
      }
    }
  } catch (error) {
    logger.error('changeMitigation ERROR: %s', error);
    if (error.message === 'Not enough budget') {
      throw error;
    }
    throw new Error('Server error on change mitigation');
  }
  return getGame(gameId);
};

const startSimulation = async (gameId) => {
  try {
    const { state, millisTakenBeforeStarted } = await db('game')
      .select(
        'state',
        'millis_taken_before_started as millisTakenBeforeStarted',
      )
      .where({ id: gameId })
      .first();
    if (state === GameStates.ASSESSMENT) {
      throw new Error('Cannot start finalized game');
    }
    await db('game')
      .where({ id: gameId })
      .update({
        started_at: db.fn.now(),
        paused: false,
        ...(state === GameStates.PREPARATION
          ? { state: GameStates.SIMULATION, budget: 0 }
          : {}),
      });
    if (state === GameStates.PREPARATION) {
      const gameMitigations = await db('game_mitigation')
        .select('game_mitigation.mitigation_id as gameMitigationId')
        .where({
          game_id: gameId,
          state: true,
        });
      const mitigationClauses = gameMitigations.map(
        ({ gameMitigationId }) => gameMitigationId,
      );
      await db('game_injection')
        .where({
          game_id: gameId,
          delivered: false,
        })
        .whereIn('injection_id', function findInjectionsToSkip() {
          this.select('id')
            .from('injection')
            .whereIn('skipper_mitigation', mitigationClauses);
        })
        .update({ prevented: true, prevented_at: millisTakenBeforeStarted });
    }
    await db('game_log').insert({
      game_id: gameId,
      game_timer: millisTakenBeforeStarted,
      type: 'Game State Changed',
      description:
        state === GameStates.PREPARATION
          ? 'Simulation Started'
          : 'Timer Started',
    });
  } catch (error) {
    if (error.message === 'Cannot start finalized game') {
      throw error;
    }
    logger.error('startSimulation ERROR: %s', error);
    throw new Error('Server error on start simulation');
  }
  return getGame(gameId);
};

const pauseSimulation = async ({ gameId, finishSimulation = false }) => {
  try {
    const { millisTakenBeforeStarted, startedAt, paused } = await db('game')
      .select(
        'millis_taken_before_started as millisTakenBeforeStarted',
        'started_at as startedAt',
        'paused',
      )
      .where({ id: gameId, state: GameStates.SIMULATION })
      .first();
    const newMillisTakenBeforeStarted =
      millisTakenBeforeStarted + (Date.now() - new Date(startedAt).getTime());
    await db('game')
      .where({ id: gameId, state: GameStates.SIMULATION })
      .update({
        paused: true,
        ...(!paused
          ? { millis_taken_before_started: newMillisTakenBeforeStarted }
          : {}),
        ...(finishSimulation ? { state: GameStates.ASSESSMENT } : {}),
      });
    await db('game_log').insert({
      game_id: gameId,
      ...(!paused
        ? { game_timer: newMillisTakenBeforeStarted }
        : { game_timer: millisTakenBeforeStarted }),
      type: 'Game State Changed',
      description: finishSimulation ? 'Game Finalized' : 'Timer Stopped',
    });
  } catch (error) {
    if (finishSimulation) {
      logger.error('finishSimulation ERROR: %s', error);
    } else {
      logger.error('pauseSimulation ERROR: %s', error);
    }
    throw new Error('Server error on pause simulation');
  }
  return getGame(gameId);
};

// Use for respond to injection and restore system
const makeResponses = async ({
  responseIds,
  gameId,
  injectionId,
  customResponse,
}) => {
  try {
    const game = await db('game')
      .select(
        'game.id',
        'game.budget',
        'game.started_at as startedAt',
        'game.paused',
        'game.millis_taken_before_started as millisTakenBeforeStarted',
        'm.mitigations',
      )
      .where({ 'game.id': gameId })
      .joinRaw(
        `LEFT JOIN (SELECT gm.game_id, array_agg(to_json(gm)) AS mitigations FROM game_mitigation gm GROUP BY gm.game_id) m ON m.game_id = game.id`,
      )
      .first();
    const timeTaken = getTimeTaken(game);
    if (responseIds?.length) {
      const responses = await getResponsesById(responseIds);
      const gameMitigations = game.mitigations.reduce(
        (mitigationsAcc, { mitigation_id: mitigationId, location, state }) => ({
          ...mitigationsAcc,
          [`${mitigationId}_${location}`]: state,
        }),
        {},
      );
      // CHECK REQUIRED MITIGATION
      responses.forEach(
        ({
          required_mitigation_type: requiredMitigationType,
          required_mitigation: requiredMitigation,
        }) => {
          if (
            requiredMitigationType &&
            requiredMitigation &&
            !(requiredMitigationType === 'party'
              ? gameMitigations[`${requiredMitigation}_hq`] &&
                gameMitigations[`${requiredMitigation}_local`]
              : gameMitigations[
                  `${requiredMitigation}_${requiredMitigationType}`
                ])
          ) {
            throw new Error('Response not allowed');
          }
        },
      );
      // CHECK AVAILABLE BUDGET
      const cost = responses.reduce(
        (acc, { cost: responseCost }) => acc + responseCost,
        0,
      );
      if (game.budget < cost) {
        throw new Error('Not enough budget');
      }
      // ALLOCATE BUDGET
      if (cost) {
        await db('game')
          .where({ id: gameId })
          .update({ budget: Math.max(0, game.budget - cost) });
      }
      // SET MITIGATIONS
      await Promise.all(
        responses.map(
          async ({
            mitigation_type: mitigationType,
            mitigation_id: mitigationId,
          }) => {
            if (mitigationId) {
              await db('game_mitigation')
                .where({
                  game_id: gameId,
                  mitigation_id: mitigationId,
                  ...(mitigationType !== 'party'
                    ? { location: mitigationType }
                    : {}),
                })
                .update({ state: true });
              await db('game_injection')
                .where({ game_id: gameId, delivered: false, prevented: false })
                .whereIn('injection_id', function findInjectionsToSkip() {
                  this.select('id').from('injection').where({
                    skipper_mitigation: mitigationId,
                  });
                })
                .update({ prevented: true, prevented_at: timeTaken });
            }
          },
        ),
      );
      // SET SYSTEMS
      const systemIdsToRestore = responses.reduce(
        (acc, { systems_to_restore: systemsToRestore }) => {
          if (systemsToRestore && systemsToRestore.length) {
            return [...acc, ...systemsToRestore];
          }
          return acc;
        },
        [],
      );
      if (systemIdsToRestore.length !== 0) {
        await db('game_system')
          .where({ game_id: gameId })
          .whereIn('system_id', systemIdsToRestore)
          .update({ state: true });
      }
    }
    // SET GAME INJECTION
    if (injectionId) {
      const { followupInjecion } = await db('injection')
        .select('followup_injecion as followupInjecion')
        .where('id', injectionId)
        .first();
      if (followupInjecion) {
        await db('game_injection')
          .where({
            game_id: gameId,
            delivered: false,
            injection_id: followupInjecion,
          })
          .update({
            prevented: true,
            prevented_at: timeTaken,
          });
      }
      await db('game_injection')
        .where({
          game_id: gameId,
          injection_id: injectionId,
        })
        .update({
          ...(responseIds?.length
            ? { predefined_responses_made: responseIds }
            : {}),
          is_response_correct: true,
          response_made_at: timeTaken,
          ...(customResponse ? { custom_response: customResponse } : {}),
        });
    } else {
      await db('game_log').insert({
        game_id: gameId,
        game_timer: timeTaken,
        type: 'System Restore Action',
        response_id: responseIds[0],
      });
    }
  } catch (error) {
    logger.error('makeResponses ERROR: %s', error);
    if (
      error.message === 'Not enough budget' ||
      error.message === 'Response not allowed'
    ) {
      throw error;
    }
    throw new Error('Server error on making respone');
  }
  return getGame(gameId);
};

const deliverGameInjection = async ({ gameId, injectionId }) => {
  try {
    const game = await db('game')
      .select(
        'started_at as startedAt',
        'paused',
        'millis_taken_before_started as millisTakenBeforeStarted',
        'poll',
      )
      .where({ id: gameId })
      .first();
    const { systemsToDisable, pollChange } = await db('injection')
      .select(
        'systems_to_disable as systemsToDisable',
        'poll_change as pollChange',
      )
      .where({ id: injectionId })
      .first();
    if (systemsToDisable?.length) {
      await db('game_system')
        .where({ game_id: gameId })
        .whereIn('system_id', systemsToDisable)
        .update({ state: false });
    }
    if (pollChange) {
      await db('game')
        .where({ id: gameId })
        .update({
          poll: Math.max(0, Math.min(game.poll + pollChange, 200)),
        });
    }
    await db('game_injection')
      .where({
        game_id: gameId,
        injection_id: injectionId,
      })
      .update({ delivered: true, delivered_at: getTimeTaken(game) });
  } catch (error) {
    logger.error('deliverGameInjection ERROR: %s', error);
    throw new Error('Server error on changing games injection deliverance');
  }
  return getGame(gameId);
};

const makeNonCorrectInjectionResponse = async ({
  gameId,
  injectionId,
  customResponse,
}) => {
  try {
    const game = await db('game')
      .select(
        'started_at as startedAt',
        'paused',
        'millis_taken_before_started as millisTakenBeforeStarted',
      )
      .where({ id: gameId })
      .first();
    await db('game_injection')
      .where({
        game_id: gameId,
        injection_id: injectionId,
      })
      .update({
        response_made_at: getTimeTaken(game),
        ...(customResponse ? { custom_response: customResponse } : {}),
      });
  } catch (error) {
    logger.error('makeNonCorrectInjectionResponse ERROR: %s', error);
    throw new Error('Server error on making non correct injection response');
  }
  return getGame(gameId);
};

const performAction = async ({ gameId, actionId }) => {
  try {
    const game = await db('game')
      .select(
        'budget',
        'poll',
        'started_at as startedAt',
        'paused',
        'millis_taken_before_started as millisTakenBeforeStarted',
      )
      .where({ id: gameId })
      .first();

    const { cost, budgetIncrease, pollIncrease, requiredSystems } = await db(
      'action',
    )
      .select(
        'cost',
        'budget_increase as budgetIncrease',
        'poll_increase as pollIncrease',
        'required_systems as requiredSystems',
      )
      .where({ id: actionId })
      .first();

    if (game.budget < cost) {
      throw new Error('Not enough budget');
    }

    const unavailableSystems = await db('game_system')
      .select()
      .where({ game_id: gameId, state: false })
      .whereIn('system_id', requiredSystems);

    if (unavailableSystems.length > 0) {
      throw new Error(
        'The required systems for this action are not available.',
      );
    }

    await db('game')
      .where({ id: gameId })
      .update({
        budget: Math.max(0, game.budget - cost + budgetIncrease),
        poll: Math.max(0, Math.min(game.poll + pollIncrease, 200)),
      });
    await db('game_log').insert({
      game_id: gameId,
      game_timer: getTimeTaken(game),
      type: 'Campaign Action',
      action_id: actionId,
    });
  } catch (error) {
    logger.error('performAction ERROR: %s', error);
    switch (error.message) {
      case 'Not enough budget':
        throw error;
      case 'The required systems for this action are not available':
        throw error;
      default:
        throw new Error('Server error on performing action');
    }
  }
  return getGame(gameId);
};

const performCurveball = async ({ gameId, curveballId }) => {
  try {
    const game = await db('game')
      .select(
        'budget',
        'poll',
        'started_at as startedAt',
        'paused',
        'millis_taken_before_started as millisTakenBeforeStarted',
      )
      .where({ id: gameId })
      .first();

    const { budgetChange, pollChange, loseAllBudget } = await db('curveball')
      .select(
        'lose_all_budget as loseAllBudget',
        'budget_change as budgetChange',
        'poll_change as pollChange',
      )
      .where({ id: curveballId })
      .first();

    await db('game')
      .where({ id: gameId })
      .update({
        budget: loseAllBudget ? 0 : Math.max(0, game.budget + budgetChange),
        poll: Math.min(Math.max(game.poll + pollChange, 0), 200),
      });

    await db('game_log').insert({
      game_id: gameId,
      game_timer: getTimeTaken(game),
      type: 'Curveball Event',
      curveball_id: curveballId,
    });
  } catch (error) {
    logger.error('performCurveball ERROR: %s', error);
    throw new Error('Server error on performing action');
  }
  return getGame(gameId);
};

module.exports = {
  createGame,
  getGame,
  changeMitigation,
  performAction,
  startSimulation,
  pauseSimulation,
  makeResponses,
  deliverGameInjection,
  makeNonCorrectInjectionResponse,
  performCurveball,
};
