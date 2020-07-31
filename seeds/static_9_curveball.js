exports.seed = (knex) =>
  knex('curveball')
    .del()
    .then(() =>
      knex('curveball').insert([
        {
          id: 'C1',
          description: 'Terrorist attack',
          poll_change: -10,
        },
        {
          id: 'C2',
          description: 'World Cup win',
          poll_change: -5,
        },
        {
          id: 'C3',
          description: 'Embezzlement',
          lose_all_budget: true,
        },
        {
          id: 'C4',
          description: 'Banking system crash',
          poll_change: 10,
          lose_all_budget: true,
        },
        {
          id: 'C5',
          description: 'Wiretapping scandal by the incumbent',
          poll_change: 5,
        },
        {
          id: 'C6',
          description:
            'President Boggs makes sexist remarks about Alissa, spurring donation surge for her campaign',
          budget_change: 1000,
        },
      ]),
    );
