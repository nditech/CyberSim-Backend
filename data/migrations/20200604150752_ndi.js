exports.up = (knex) => knex.schema.createTable('ndi', (tbl) => {
  tbl.increments();
  tbl.text('task').notNullable();
});

exports.down = (knex) => knex.schema.dropTableIfExists('ndi');
