const db = require('./db');
const { getResponsesById } = require('./response');
const logger = require('../logger');
const GameStates = require('../constants/GameStates');
const { getTimeTaken } = require('../util');

// TODO: write tests for these functions

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
      'game.prevented_injections',
      'game.every_injection_checked',
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

const createGame = async (id) => {
  await db('game').insert(
    {
      id,
    },
    ['id'],
  );
  const systems = await db('system');
  await db('game_system').insert(
    systems.map(({ id: systemId }) => ({
      game_id: id,
      system_id: systemId,
      state: true,
    })),
  );
  const mitigations = await db('mitigation');
  await db('game_mitigation').insert(
    mitigations.reduce(
      (acc, { id: mitigationId, is_hq: isHq, is_local: isLocal }) => {
        if (isHq) {
          acc.push({
            game_id: id,
            mitigation_id: mitigationId,
            location: 'hq',
            state: false,
          });
        }
        if (isLocal) {
          acc.push({
            game_id: id,
            mitigation_id: mitigationId,
            location: 'local',
            state: false,
          });
        }
        return acc;
      },
      [],
    ),
  );
  return getGame(id);
};

const changeMitigation = async ({
  mitigationId,
  mitigationType,
  mitigationValue,
  gameId,
}) => {
  try {
    const game = await db('game')
      .select(
        'budget',
        'state',
        'started_at',
        'paused',
        'millis_taken_before_started',
      )
      .where({ 'game.id': gameId })
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
        location: mitigationType,
      })
      .first();

    if (gameMitigationValue !== mitigationValue) {
      const [{ cost }] = await db('mitigation')
        .select(`${mitigationType}_cost as cost`)
        .where({ id: mitigationId });
      if (cost) {
        if (mitigationValue && game.budget < cost) {
          throw new Error('Not enough budget');
        }
        await db('game')
          .where({ id: gameId })
          .update({
            budget: mitigationValue ? game.budget - cost : game.budget + cost,
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
        await db('game_log').insert({
          game_id: gameId,
          game_timer: getTimeTaken(game),
          type: 'Budget Item Purchase',
          mitigation_id: mitigationId,
          mitigation_type: mitigationType,
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

let hasGamesToInject = true;
let startingGame = false;
const startSimulation = async (gameId) => {
  try {
    startingGame = true;
    const {
      state,
      millis_taken_before_started: millisTakenBeforeStarted,
    } = await db('game')
      .select('state', 'millis_taken_before_started')
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
          ? { state: GameStates.SIMULATION }
          : {}),
      });
    await db('game_log').insert({
      game_id: gameId,
      game_timer: millisTakenBeforeStarted,
      type: 'Game State Changed',
      descripition:
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
  } finally {
    hasGamesToInject = true;
    startingGame = false;
  }
  return getGame(gameId);
};

const pauseSimulation = async ({ gameId, finishSimulation = false }) => {
  try {
    const {
      millis_taken_before_started: millisTakenBeforeStarted,
      started_at: startedAt,
      paused,
    } = await db('game')
      .select('millis_taken_before_started', 'started_at', 'paused')
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
      game_timer: newMillisTakenBeforeStarted,
      type: 'Game State Changed',
      descripition: finishSimulation ? 'Game Finalized' : 'Timer Stopped',
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
const makeResponses = async ({ responseIds, gameId, injectionId }) => {
  try {
    const responses = await getResponsesById(responseIds);
    const game = await db('game')
      .select(
        'game.id',
        'game.budget',
        'game.prevented_injections',
        'game.started_at',
        'game.paused',
        'game.millis_taken_before_started',
        'i.injected_ids',
        'm.mitigations',
      )
      .where({ 'game.id': gameId })
      .joinRaw(
        `LEFT JOIN (SELECT gm.game_id, array_agg(to_json(gm)) AS mitigations FROM game_mitigation gm GROUP BY gm.game_id) m ON m.game_id = game.id`,
      )
      .joinRaw(
        `LEFT JOIN (SELECT gi.game_id, array_agg(gi.injection_id) AS injected_ids FROM game_injection gi GROUP BY gi.game_id) i ON i.game_id = game.id`,
      )
      .first();
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
        .update({ budget: game.budget - cost });
    }
    // SET MITIGATIONS
    await Promise.all(
      responses.map(
        ({ mitigation_type: mitigationType, mitigation_id: mitigationId }) =>
          db('game_mitigation')
            .where({
              game_id: gameId,
              mitigation_id: mitigationId,
              ...(mitigationType !== 'party'
                ? { location: mitigationType }
                : {}),
            })
            .update({ state: true }),
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
    const timeTaken = getTimeTaken(game);
    // SET GAME INJECTION
    if (injectionId) {
      const injectionResponses = await db('injection_response')
        .select('injection_to_prevent')
        .where('injection_id', injectionId)
        .whereIn('response_id', responseIds);
      const preventedInjections = [
        ...injectionResponses.reduce(
          (acc, { injection_to_prevent: injectionToPrevent }) => {
            if (
              injectionToPrevent &&
              !game.injected_ids.some((id) => id === injectionToPrevent)
            ) {
              acc.add(injectionToPrevent);
            }
            return acc;
          },
          new Set([...game.prevented_injections]),
        ),
      ];
      if (preventedInjections.length !== game.prevented_injections.length) {
        await db('game').where({ id: gameId }).update({
          prevented_injections: preventedInjections,
        });
      }
      await db('game_injection')
        .where({
          game_id: gameId,
          injection_id: injectionId,
        })
        .update({
          delivered: true,
          correct_responses_made: responseIds,
          response_made_at: timeTaken,
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

const injectGames = async () => {
  if (!hasGamesToInject) {
    return [];
  }
  const games = await db('game')
    .select(
      'game.id',
      'game.started_at',
      'game.paused',
      'game.millis_taken_before_started',
      'game.prevented_injections',
      'game.poll',
      'i.injected_ids',
      'm.mitigations',
    )
    .where({
      'game.paused': false,
      'game.state': GameStates.SIMULATION,
      'game.every_injection_checked': false,
    })
    .joinRaw(
      `LEFT JOIN (SELECT gm.game_id, array_agg(to_json(gm)) AS mitigations FROM game_mitigation gm GROUP BY gm.game_id) m ON m.game_id = game.id`,
    )
    .joinRaw(
      `LEFT JOIN (SELECT gi.game_id, array_agg(gi.injection_id) AS injected_ids FROM game_injection gi GROUP BY gi.game_id) i ON i.game_id = game.id`,
    );
  if (games.length === 0) {
    if (!startingGame) {
      hasGamesToInject = false;
    }
    return [];
  }
  const injections = await db('injection').orderBy('trigger_time');
  const currentTime = Date.now();
  return Promise.all(
    games
      .reduce((acc, game) => {
        const timeTaken = getTimeTaken(game, currentTime);
        const injectionsToSkip = [];
        const injectionsToInject = [];
        const gameMitigations = game.mitigations.reduce(
          (
            mitigationsAcc,
            { mitigation_id: mitigationId, location, state },
          ) => ({
            ...mitigationsAcc,
            [`${mitigationId}_${location}`]: state,
          }),
          {},
        );
        injections.some((injection) => {
          const isFuture = injection.trigger_time > timeTaken;
          // stop iteration
          if (isFuture) {
            return true;
          }
          // do nothing with prevented_injections and injections already injected
          if (
            (game.prevented_injections &&
              game.prevented_injections.some(
                (injectionId) => injectionId === injection.id,
              )) ||
            (game.injected_ids &&
              game.injected_ids.some(
                (injectedId) => injectedId === injection.id,
              ))
          ) {
            return false;
          }
          if (
            injection.skipper_mitigation &&
            injection.skipper_mitigation_type &&
            gameMitigations[
              `${injection.skipper_mitigation}_${injection.skipper_mitigation_type}`
            ]
          ) {
            injectionsToSkip.push(injection); // skip and add to prevented_injections
          } else {
            injectionsToInject.push(injection); // inject injection
          }
          return false;
        });
        if (injectionsToSkip.length || injectionsToInject.length) {
          return [...acc, { game, injectionsToSkip, injectionsToInject }];
        }
        return acc;
      }, [])
      .map(async ({ game, injectionsToSkip, injectionsToInject }) => {
        // 1. Add injections
        await Promise.all(
          injectionsToInject.map(async (injection) =>
            db('game_injection').insert({
              game_id: game.id,
              injection_id: injection.id,
            }),
          ),
        );
        // 2. Save prevented injections, update every_injection_checked
        const everyInjectionChecked =
          injections.length ===
          [
            ...(game.injected_ids || []),
            ...(game.prevented_injections || []),
            ...injectionsToSkip,
            ...injectionsToInject,
          ].length;
        if (injectionsToSkip.length || everyInjectionChecked) {
          await db('game')
            .where({ 'game.id': game.id })
            .update({
              ...(everyInjectionChecked
                ? {
                    every_injection_checked: true,
                  }
                : {}),
              ...(injectionsToSkip.length
                ? {
                    prevented_injections: (
                      game.prevented_injections || []
                    ).concat(injectionsToSkip.map((i) => i.id)),
                  }
                : {}),
            });
        }
        return getGame(game.id);
      }),
  );
};

const deilverGameInjection = async ({ gameId, injectionId }) => {
  try {
    const injection = await db('injection')
      .select('systems_to_disable', 'poll_change')
      .where({ id: injectionId })
      .first();
    if (injection.systems_to_disable.length) {
      await db('game_system')
        .where({ game_id: gameId })
        .whereIn('system_id', injection.systems_to_disable)
        .update({ state: false });
    }
    if (injection.poll_change) {
      const game = await db('game')
        .select('poll')
        .where({ id: gameId })
        .first();
      await db('game')
        .where({ 'game.id': gameId })
        .update({
          poll: Math.max(0, game.poll + injection.poll_change),
        });
    }
    await db('game_injection')
      .where({
        game_id: gameId,
        injection_id: injectionId,
      })
      .update({ delivered: true });
  } catch (error) {
    logger.error('deilverGameInjection ERROR: %s', error);
    throw new Error('Server error on changing games injection deliverance');
  }
  return getGame(gameId);
};

const makeNonCorrectInjectionResponse = async ({ gameId, injectionId }) => {
  try {
    const game = await db('game')
      .select(
        'game.started_at',
        'game.paused',
        'game.millis_taken_before_started',
      )
      .where({ 'game.id': gameId })
      .first();
    const timeTaken = getTimeTaken(game);
    await db('game_injection')
      .where({
        game_id: gameId,
        injection_id: injectionId,
      })
      .update({
        delivered: true,
        response_made_at: timeTaken,
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
        'game.budget',
        'game.poll',
        'game.started_at',
        'game.paused',
        'game.millis_taken_before_started',
      )
      .where({ 'game.id': gameId })
      .first();

    const {
      cost,
      budget_increase: budgetIncrease,
      poll_increase: pollIncrease,
      required_systems: requiredSystems,
    } = await db('action').where({ id: actionId }).first();

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
        budget: game.budget - cost + budgetIncrease,
        poll: Math.min(game.poll + pollIncrease, 100),
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

module.exports = {
  createGame,
  getGame,
  changeMitigation,
  performAction,
  startSimulation,
  pauseSimulation,
  makeResponses,
  injectGames,
  deilverGameInjection,
  makeNonCorrectInjectionResponse,
};
