exports.up = async (knex) => {
  await knex.schema.createTable('dictionary', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('word').notNullable();
    tbl.string('synonym').notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('dictionary');
};
