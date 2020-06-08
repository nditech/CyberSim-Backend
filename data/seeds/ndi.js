
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
      state: 'SIMULATION',
      poll: 43,
      budget: 30000,
      systems: {
        computer: false,
      },
    },
    {
      id: 'thrid Room',
      state: 'ASSESSMENT',
      poll: 63,
      budget: 10000,
      systems: {
        computer: true,
      },
    },
  ]));
