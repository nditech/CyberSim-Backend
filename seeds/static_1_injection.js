const injection = require('./v0/1_injection.json');

exports.seed = (knex) =>
  knex('injection')
    .del()
    .then(() => knex('injection').insert(injection));
