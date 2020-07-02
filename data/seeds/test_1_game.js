// TEST DATA

exports.seed = async (knex) => {
  await knex('game').del();
  // await knex('game').insert([
  //   {
  //     id: 'testGame',
  //     state: 'SIMULATION',
  //     poll: 80,
  //     started_at: knex.fn.now(),
  //     paused: true,
  //   },
  // ]);
};
