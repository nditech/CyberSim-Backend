
exports.seed = (knex) => knex('ndi').del()
  .then(() => knex('ndi').insert([
    {
      id: 'first game room',
      state: 'PREPARATION',
      poll: 100,
      budget: 50000,
      systems: {
        computer: true,
      },
    },
    {
      id: 'second gameRRoom',
      state: 'PROGRESS',
      poll: 43,
      budget: 30000,
      systems: {
        computer: false,
      },
    },
    {
      id: 'thrid Room',
      state: 'SCORE',
      poll: 63,
      budget: 10000,
      systems: {
        computer: true,
      },
    },
  ]));
