exports.seed = (knex) => knex('role').del()
  .then(() => knex('role').insert([
    { id: 'R1', name: 'Candidate' },
    { id: 'R2', name: 'HQ Campaign Manager' },
    { id: 'R3', name: 'HQ IT Team' },
    { id: 'R4', name: 'HQ Communications Team' },
    { id: 'R5', name: 'HQ Campaign Team' },
    { id: 'R6', name: 'HQ - All Actors' },
    { id: 'R7', name: 'Local Branch Manager' },
    { id: 'R8', name: 'Local Communications Team' },
    { id: 'R9', name: 'Local Campaign Volunteers' },
    { id: 'R10', name: 'Local Branch - All Actors' },
  ]));
