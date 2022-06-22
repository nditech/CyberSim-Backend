const response = require('./v0/3_response.json');

exports.seed = (knex) =>
  knex('response')
    .del()
    .then(() => knex('response').insert(response));
