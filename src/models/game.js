const db = require('./db');

const getGame = (id) => db('game')
  .select(
    'game.id',
    'game.state',
    'game.poll',
    'game.budget',
    'game.started_at',
    db.raw('to_json(game_mitigations.*) as mitigations'),
    db.raw('to_json(game_logs.*) as logs'),
    db.raw('to_json(game_systems.*) as systems'),
  )
  .where({ 'game.id': id })
  .join('game_mitigations', 'game.mitigations_id', 'game_mitigations.id')
  .join('game_logs', 'game.logs_id', 'game_logs.id')
  .join('game_systems', 'game.systems_id', 'game_systems.id')
  .first();

const createGame = async (id) => {
  const [{ id: mitigationsId }] = await db('game_mitigations').insert({}, ['id']);
  const [{ id: logsId }] = await db('game_logs').insert({}, ['id']);
  const [{ id: systemsId }] = await db('game_systems').insert({}, ['id']);
  await db('game').insert({
    id,
    state: 'PREPARATION',
    poll: 0,
    budget: 50000,
    mitigations_id: mitigationsId,
    logs_id: logsId,
    systems_id: systemsId,
  }, ['id']);
  return getGame(id);
};

const changeMitigation = async ({
  mitigationId, mitigationType, mitigationValue, gameId, adjustBudget,
}) => {
  const gameMitigationId = `${mitigationId}_${mitigationType}`;
  const { mitigations_id: gameMitigationsId, gameMitigationIdValue, budget } = await db('game')
    .select('game.mitigations_id', `game_mitigations.${gameMitigationId} as gameMitigationIdValue`, 'game.budget')
    .where({ 'game.id': gameId })
    .join('game_mitigations', 'game.mitigations_id', 'game_mitigations.id')
    .first();

  if (gameMitigationIdValue !== mitigationValue) {
    if (adjustBudget) {
      const [{ cost }] = await db('mitigation').select(`${mitigationType}_cost as cost`).where({ id: mitigationId });
      if (cost) {
        if (mitigationValue && budget < cost) {
          throw new Error('Not enought budget');
        }
        await db('game').where({ id: gameId }).update({ budget: mitigationValue ? budget - cost : budget + cost });
      }
    }
    await db('game_mitigations').where({ id: gameMitigationsId }).update({ [gameMitigationId]: mitigationValue });
  }
  return getGame(gameId);
};

module.exports = { createGame, getGame, changeMitigation };
