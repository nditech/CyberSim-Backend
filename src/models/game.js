const db = require('./db');
const { getResponse } = require('./response');
const logger = require('../logger');

const getGame = (id) => db('game')
  .select(
    'game.id',
    'game.state',
    'game.poll',
    'game.budget',
    'game.started_at',
    'game.paused',
    'game.millis_taken_before_started',
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
    state: 'PREPARATION',
    poll: 0,
    budget: 50000,
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

const startSimulation = async (gameId) => {
  try {
    await db('game')
      .where({ id: gameId, state: 'PREPARATION' })
      .orWhere({ id: gameId, state: 'SIMULATION' })
      .update({ state: 'SIMULATION', started_at: db.fn.now(), paused: false });
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
    const game = await getGame(gameId);
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
        .where({ id: game.systems.id })
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
  // TODO: get non-paused in simulation games
  // map over them
  // check if any new injection should be created for the game (game_injection)
  // return updated games in array
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
