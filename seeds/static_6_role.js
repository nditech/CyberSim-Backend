const role = require('./v0/6_role.json');

exports.seed = (knex) =>
  knex('role')
    .del()
    .then(() => knex('role').insert(role));
