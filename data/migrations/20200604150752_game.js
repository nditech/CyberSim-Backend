exports.up = (knex) => knex.schema.createTable('game', (tbl) => {
  tbl.enu('state', [
    'ASSESSMENT',
    'PREPARATION',
    'SIMULATION',
  ]).notNullable().defaultTo('PREPARATION');
  tbl.string('id').notNullable();
  tbl.index('id');
  tbl.unique('id');
  tbl.integer('poll').notNullable().defaultTo(0);
  tbl.integer('budget').notNullable().defaultTo(0);
  tbl.integer('allocated_budget').defaultTo(0);
  tbl.timestamp('started_at');
  tbl.json('systems');
  tbl.json('mitigations');
  tbl.json('log');
});

exports.down = (knex) => knex.schema.dropTableIfExists('game');
