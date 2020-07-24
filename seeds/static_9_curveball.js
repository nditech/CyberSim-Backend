exports.seed = (knex) =>
  knex('curveball')
    .del()
    .then(() =>
      knex('curveball').insert([
        {
          id: 'C1',
          description: 'Sad something bad',
          budget_decrease: 0,
          poll_decrease: 1,
        },
        {
          id: 'C2',
          description: 'Did something bad',
          budget_decrease: 0,
          poll_decrease: 5,
        },
        {
          id: 'C3',
          description: 'Where did my money go?',
          budget_decrease: 500,
          poll_decrease: 0,
        },
        {
          id: 'C4',
          description: 'Disaster',
          budget_decrease: 1000,
          poll_decrease: 10,
        },
      ]),
    );
