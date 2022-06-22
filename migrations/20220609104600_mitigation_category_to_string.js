exports.up = async (knex) => {
  await knex.raw(
    'ALTER TABLE mitigation DROP CONSTRAINT IF EXISTS mitigation_category_check',
  );
};

exports.down = async () => {};
