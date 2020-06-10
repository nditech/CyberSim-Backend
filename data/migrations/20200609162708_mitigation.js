exports.up = (knex) => knex.schema.createTable('mitigation', (tbl) => {
  tbl.string('id').notNullable();
  tbl.index('id');
  tbl.unique('id');
  tbl.string('description').notNullable();
  tbl.integer('hq_cost');
  tbl.integer('local_cost');
  tbl.boolean('is_hq').notNullable();
  tbl.boolean('is_local').notNullable();
  tbl.enu('category', [
    'Operation',
    'National party voter database',
    'National party website',
    'Accounts',
    'Devices',
  ]).notNullable();
});

exports.down = (knex) => knex.schema.dropTableIfExists('mitigation');
