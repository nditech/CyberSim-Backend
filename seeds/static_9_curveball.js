const curveball = require('./v0/9_curveball.json');

exports.seed = (knex) =>
  knex('curveball')
    .del()
    .then(() => knex('curveball').insert(curveball));
