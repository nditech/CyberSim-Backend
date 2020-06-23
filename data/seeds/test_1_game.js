// TEST DATA

exports.seed = async (knex) => {
  await knex('game').del();
  await knex('game_mitigations').del();
  await knex('game_systems').del();
  const [{ id: gameMitigationsId }] = await knex('game_mitigations').insert({}, ['id']);
  const [{ id: gameSystemsId }] = await knex('game_systems').insert({}, ['id']);
  await knex('game').insert([
    {
      id: 'testGame',
      state: 'SIMULATION',
      poll: 80,
      budget: 50000,
      mitigations_id: gameMitigationsId,
      systems_id: gameSystemsId,
    },
  ]);
  await knex('game_injection').insert([
    {
      game_id: 'testGame',
      injection_id: 'I1',
    },
    {
      game_id: 'testGame',
      injection_id: 'I2',
    },
  ]);
  await knex('game_log').insert([
    {
      game_id: 'testGame',
      type: 'injection happened',
    },
    {
      game_id: 'testGame',
      type: 'injection happened',
    },
  ]);
};
