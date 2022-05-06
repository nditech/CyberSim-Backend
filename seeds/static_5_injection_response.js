const injectionResponse = require('./v0/5_injection_response.json');

exports.seed = (knex) =>
  knex('injection_response')
    .del()
    .then(() => knex('injection_response').insert(injectionResponse));
