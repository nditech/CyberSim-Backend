
exports.seed = (knex) => knex('mitigation').del()
  .then(() => knex('mitigation').insert([
    {
      id: 'M1',
      description: 'Install lockable filing cabinets to store sensitive material at Party office',
      hq_cost: 500,
      local_cost: 500,
      is_hq: true,
      is_local: true,
      category: 'Operation',
    },
  ]));
