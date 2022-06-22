const actionRole = require('./v0/8_action_role.json');

exports.seed = (knex) =>
  knex('action_role')
    .del()
    .then(() => knex('action_role').insert(actionRole));
