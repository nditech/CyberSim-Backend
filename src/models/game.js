const db = require('./db');
const { getResponse } = require('./response');
const logger = require('../logger');

// TODO: write tests for these functions

const getGame = (id) => db('game')
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
    db.raw('to_json(game_mitigations) as mitigations'),
    db.raw('to_json(game_systems) as systems'),
    'i.injections',
    'l.logs',
  )
  .where({ 'game.id': id })
  .join('game_mitigations', 'game.mitigations_id', 'game_mitigations.id')
  .join('game_systems', 'game.systems_id', 'game_systems.id')
  .joinRaw(`
    LEFT JOIN (
      SELECT gi.game_id, array_agg(to_json(gi)) AS injections FROM game_injection gi GROUP BY gi.game_id
    ) i ON i.game_id = game.id
  `)
  .joinRaw(`
    LEFT JOIN (
      SELECT gl.game_id, array_agg(to_json(gl)) AS logs FROM game_log gl GROUP BY gl.game_id
    ) l ON l.game_id = game.id
  `)
  .first();

const createGame = async (id) => {
  const [{ id: mitigationsId }] = await db('game_mitigations').insert({}, ['id']);
  const [{ id: systemsId }] = await db('game_systems').insert({}, ['id']);
  await db('game').insert({
    id,
    mitigations_id: mitigationsId,
    systems_id: systemsId,
  }, ['id']);
  return getGame(id);
};

const changeMitigation = async ({
  mitigationId, mitigationType, mitigationValue, gameId, adjustBudget,
}) => {
  try {
    const gameMitigationId = `${mitigationId}_${mitigationType}`;
    const { mitigations_id: gameMitigationsId, gameMitigationIdValue, budget } = await db('game')
      .select('game.mitigations_id', `game_mitigations.${gameMitigationId} as gameMitigationIdValue`, 'game.budget')
      .where({ 'game.id': gameId })
      .join('game_mitigations', 'game.mitigations_id', 'game_mitigations.id')
      .first();

    if (gameMitigationIdValue !== mitigationValue) {
      if (adjustBudget) {
        const [{ cost }] = await db('mitigation')
          .select(`${mitigationType}_cost as cost`)
          .where({ id: mitigationId });
        if (cost) {
          if (mitigationValue && budget < cost) {
            throw new Error('Not enough budget');
          }
          await db('game')
            .where({ id: gameId })
            .update({ budget: mitigationValue ? budget - cost : budget + cost });
        }
      }
      await db('game_mitigations')
        .where({ id: gameMitigationsId })
        .update({ [gameMitigationId]: mitigationValue });
    }
  } catch (error) {
    logger.error('CHANGEMITIGATION ERROR: %s', error);
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
    await db('game')
      .where({ id: gameId, state: 'PREPARATION' })
      .orWhere({ id: gameId, state: 'SIMULATION' })
      .update({ state: 'SIMULATION', started_at: db.fn.now(), paused: false });
    hasGamesToInject = true;
    startingGame = false;
  } catch (error) {
    logger.error('STARTSIMULATION ERROR: %s', error);
    throw new Error('Server error on start simulation');
  }
  return getGame(gameId);
};

const pauseSimulation = async ({ gameId, finishSimulation = false }) => {
  try {
    const {
      millis_taken_before_started: millisTakenBeforeStarted,
      started_at: startedAt,
    } = await db('game')
      .select('millis_taken_before_started', 'started_at')
      .where({ id: gameId, state: 'SIMULATION' })
      .first();
    await db('game')
      .where({ id: gameId, state: 'SIMULATION' })
      .update({
        millis_taken_before_started:
          millisTakenBeforeStarted + (Date.now() - new Date(startedAt).getTime()),
        paused: true,
        ...(finishSimulation ? { state: 'ASSESSMENT' } : {}),
      });
  } catch (error) {
    if (finishSimulation) {
      logger.error('FINISHSIMULATION ERROR: %s', error);
    } else {
      logger.error('PAUSESIMULATION ERROR: %s', error);
    }
    throw new Error('Server error on pause simulation');
  }
  return getGame(gameId);
};

const makeResponse = async ({ responseId, gameId }) => {
  try {
    const {
      cost,
      location,
      mitigation_id: mitigationId,
      systems_to_restore: systemsToRestore,
      required_mitigation: requiredMitigation,
      required_mitigation_type: requiredMitigationType,
    } = await getResponse(responseId);
    const game = await db('game')
      .select(
        'game.id',
        'game.budget',
        'game.systems_id',
        db.raw('to_json(game_mitigations) as mitigations'),
      )
      .where({ 'game.id': gameId })
      .join('game_mitigations', 'game.mitigations_id', 'game_mitigations.id')
      .first();
    // CHECK REQUIRED MITIGATION
    if (requiredMitigationType && requiredMitigation && !(
      requiredMitigationType === 'party'
        ? game.mitigations[`${requiredMitigation}_hq`] && game.mitigations[`${requiredMitigation}_local`]
        : game.mitigations[`${requiredMitigation}_${requiredMitigationType}`]
    )) {
      throw new Error('Response not allowed');
    }
    // CHECK AVAILABLE BUDGET
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
    if (mitigationId) {
      await db('game_mitigations')
        .where({ id: game.mitigations.id })
        .update(location !== 'party'
          ? { [`${mitigationId}_${location}`]: true }
          : { [`${mitigationId}_local`]: true, [`${mitigationId}hq`]: true });
    }
    // SET SYSTEMS
    if (systemsToRestore.length) {
      await db('game_systems')
        .where({ id: game.systems_id })
        .update(systemsToRestore.reduce((acc, systemKey) => ({
          ...acc,
          [systemKey]: true,
        }), {}));
    }
  } catch (error) {
    // TODO: change messages when this function is used with injection responses
    logger.error('RESTORESYSTEM ERROR: %s', error);
    if (error.message === 'Not enough budget' || error.message === 'Response not allowed') {
      throw error;
    }
    throw new Error('Server error on system restore');
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
      'game.systems_id',
      'i.injected_ids',
      db.raw('to_json(game_mitigations) as mitigations'),
    )
    .where({ 'game.paused': false, 'game.state': 'SIMULATION', 'game.every_injection_checked': false })
    .join('game_mitigations', 'game.mitigations_id', 'game_mitigations.id')
    .joinRaw(`
      LEFT JOIN (
        SELECT gi.game_id, array_agg(gi.injection_id) AS injected_ids FROM game_injection gi GROUP BY gi.game_id
      ) i ON i.game_id = game.id
    `);
  if (games.length === 0) {
    if (!startingGame) {
      hasGamesToInject = false;
    }
    return [];
  }
  const injections = await db('injection');
  const currentTime = Date.now();
  return Promise.all(
    games.reduce((acc, game) => {
      const timeTaken = currentTime
        - new Date(game.started_at).getTime()
        + game.millis_taken_before_started;
      const injectionsToSkip = [];
      const injectionsToInject = [];
      injections.some((injection) => {
        const isFuture = injection.trigger_time > timeTaken;
        // stop iteration
        if (isFuture) {
          return true;
        }
        // do nothing with prevented_injections and injections already injected
        if (
          (game.prevented_injections
              && game.prevented_injections.some((injectionId) => injectionId === injection.id))
          || (game.injected_ids
            && game.injected_ids.some((injectedId) => injectedId === injection.id))
        ) {
          return false;
        }
        if (
          injection.skipper_mitigation
          && injection.skipper_mitigation_type
          && game.mitigations[`${injection.skipper_mitigation}_${injection.skipper_mitigation_type}`]
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
    }, []).map(async ({ game, injectionsToSkip, injectionsToInject }) => {
      let overallPollChange = 0;
      let systemsToDisable = [];
      // 1. Add injections
      await Promise.all(injectionsToInject.map(async (injection) => {
        if (injection.poll_change) {
          overallPollChange += injection.poll_change;
        }
        if (injection.systems_to_disable.length) {
          systemsToDisable = systemsToDisable.concat(injection.systems_to_disable);
        }
        await db('game_injection').insert({
          game_id: game.id,
          injection_id: injection.id,
        });
      }));
      // 2. Change systems to down
      if (systemsToDisable.length) {
        await db('game_systems')
          .where({ id: game.systems_id })
          .update(systemsToDisable.reduce((acc, system) => ({ ...acc, [system]: false }), {}));
      }
      // 3. Change poll, save prevented injections, update every_injection_checked
      const everyInjectionChecked = injections.length === ([
        ...(game.injected_ids || []),
        ...(game.prevented_injections || []),
        ...injectionsToSkip,
        ...injectionsToInject,
      ].length);
      if (overallPollChange !== 0 || injectionsToSkip.length || everyInjectionChecked) {
        await db('game')
          .where({ 'game.id': game.id })
          .update({
            ...(everyInjectionChecked ? {
              every_injection_checked: true,
            } : {}),
            ...(overallPollChange !== 0 ? {
              poll: Math.max(0, game.poll + overallPollChange),
            } : {}),
            ...(injectionsToSkip.length ? {
              prevented_injections: (game.prevented_injections || [])
                .concat(injectionsToSkip.map((i) => i.id)),
            } : {}),
          });
      }
      return getGame(game.id);
    }),
  );
};

module.exports = {
  createGame,
  getGame,
  changeMitigation,
  startSimulation,
  pauseSimulation,
  makeResponse,
  injectGames,
};
