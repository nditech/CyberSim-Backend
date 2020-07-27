exports.seed = (knex) =>
  knex('curveball')
    .del()
    .then(() =>
      knex('curveball').insert([
        {
          id: 'C1',
          description: 'Sad something bad',
          budget_change: 0,
          poll_change: -1,
        },
        {
          id: 'C2',
          description: 'Did something bad',
          budget_change: 0,
          poll_change: -5,
        },
        {
          id: 'C3',
          description: 'Where did my money go?',
          budget_change: -500,
          poll_change: 0,
        },
        {
          id: 'C4',
          description: 'Disaster',
          budget_change: -1000,
          poll_change: -10,
        },
        {
          id: 'C5',
          description: 'Donation',
          budget_change: 1000,
          poll_change: 0,
        },
        {
          id: 'C6',
          description: 'Other party made something bad',
          budget_change: 0,
          poll_change: 5,
        },
        {
          id: 'C7',
          description: 'Miracle',
          budget_change: 1500,
          poll_change: 10,
        },
        {
          id: 'C8',
          description: 'Corrupt party members',
          budget_change: 2000,
          poll_change: -5,
        },
      ]),
    );
