const pg = require('pg');

// Return decimals as numbers not strings
pg.types.setTypeParser(1700, parseFloat);

const knex = require('knex');

const knexfile = require('../../knexfile');

module.exports = knex(knexfile);
