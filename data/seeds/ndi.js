
exports.seed = (knex) => knex('ndi').del()
  .then(() => knex('ndi').insert([
    { id: 1, task: 'rowValue1' },
    { id: 2, task: 'rowValue2' },
    { id: 3, task: 'rowValue3' },
  ]));
