// TEST DATA

exports.seed = async (knex) => {
  await knex('game').del();
  await knex('game_mitigations').del();
  await knex('game_systems').del();
  await knex('game_logs').del();
  const [{ id: gameMitigationsId }] = await knex('game_mitigations').insert({}, ['id']);
  const [{ id: gameSystemsId }] = await knex('game_systems').insert({}, ['id']);
  const [{ id: gameLogsId }] = await knex('game_logs').insert({}, ['id']);
  await knex('game').insert([
    {
      id: 'first game room',
      state: 'PREPARATION',
      poll: 100,
      budget: 50000,
      mitigations_id: gameMitigationsId,
      logs_id: gameLogsId,
      systems_id: gameSystemsId,
    },
  ], ['id']);
};
