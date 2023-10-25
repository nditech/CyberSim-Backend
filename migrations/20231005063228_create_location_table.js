exports.up = async (knex) => {
  await knex.schema.createTable('location', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('name').notNullable();
    tbl.enu('type', ['hq', 'local']).notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('location');
};
