exports.seed = (knex) =>
  knex('action_role')
    .del()
    .then(() =>
      knex('action_role').insert([
        { action_id: 'A1', role_id: 'R1' },
        { action_id: 'A2', role_id: 'R7' },
        { action_id: 'A3', role_id: 'R5' },
        { action_id: 'A4', role_id: 'R9' },
        { action_id: 'A5', role_id: 'R2' },
        { action_id: 'A5', role_id: 'R4' },
        { action_id: 'A6', role_id: 'R8' },
        { action_id: 'A7', role_id: 'R3' },
        { action_id: 'A8', role_id: 'R1' },
        { action_id: 'A9', role_id: 'R5' },
        { action_id: 'A10', role_id: 'R9' },
        { action_id: 'A11', role_id: 'R2' },
        { action_id: 'A11', role_id: 'R4' },
        { action_id: 'A12', role_id: 'R2' },
        { action_id: 'A12', role_id: 'R4' },
        { action_id: 'A13', role_id: 'R7' },
        { action_id: 'A13', role_id: 'R8' },
        { action_id: 'A14', role_id: 'R7' },
        { action_id: 'A14', role_id: 'R8' },
      ]),
    );
