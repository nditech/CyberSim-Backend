exports.up = (knex) => knex.schema.createTable('game', (tbl) => {
  tbl.enu('state', [
    'ASSESSMENT',
    'PREPARATION',
    'SIMULATION',
  ]).notNullable();
  tbl.string('id').notNullable();
  tbl.index('id');
  tbl.unique('id');
  tbl.integer('poll').notNullable();
  tbl.integer('budget').notNullable();
  tbl.timestamp('started_at');
  tbl.json('systems');
  tbl.json('mitigations');
  tbl.json('log');
});

exports.down = (knex) => knex.schema.dropTableIfExists('game');
