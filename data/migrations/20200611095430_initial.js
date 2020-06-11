
exports.up = async (knex) => {
  await knex.schema.createTable('system', (tbl) => {
    tbl.string('id').notNullable();
    tbl.index('id');
    tbl.unique('id');
    tbl.string('name').notNullable();
    tbl.string('description');
    tbl.enu('type', [
      'HQ',
      'Party',
      'LB',
    ]).notNullable();
  });

  await knex.schema.createTable('mitigation', (tbl) => {
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

  await knex.schema.createTable('game_mitigations', (tbl) => {
    tbl.increments('id');
    tbl.boolean('M1_hq').notNullable().defaultTo(false);
    tbl.boolean('M2_hq').notNullable().defaultTo(false);
    tbl.boolean('M3_hq').notNullable().defaultTo(false);
    tbl.boolean('M4_hq').notNullable().defaultTo(false);
    tbl.boolean('M5_hq').notNullable().defaultTo(false);
    tbl.boolean('M6_hq').notNullable().defaultTo(false);
    tbl.boolean('M7_hq').notNullable().defaultTo(false);
    tbl.boolean('M8_hq').notNullable().defaultTo(false);
    tbl.boolean('M9_hq').notNullable().defaultTo(false);
    tbl.boolean('M10_hq').notNullable().defaultTo(false);
    tbl.boolean('M11_hq').notNullable().defaultTo(false);
    tbl.boolean('M12_hq').notNullable().defaultTo(false);
    tbl.boolean('M13_hq').notNullable().defaultTo(false);
    tbl.boolean('M14_hq').notNullable().defaultTo(false);
    tbl.boolean('M15_hq').notNullable().defaultTo(false);
    tbl.boolean('M16_hq').notNullable().defaultTo(false);
    tbl.boolean('M17_hq').notNullable().defaultTo(false);
    tbl.boolean('M18_hq').notNullable().defaultTo(false);
    tbl.boolean('M19_hq').notNullable().defaultTo(false);
    tbl.boolean('M20_hq').notNullable().defaultTo(false);
    tbl.boolean('M21_hq').notNullable().defaultTo(false);
    tbl.boolean('M22_hq').notNullable().defaultTo(false);
    tbl.boolean('M23_hq').notNullable().defaultTo(false);
    tbl.boolean('M24_hq').notNullable().defaultTo(false);
    tbl.boolean('M25_hq').notNullable().defaultTo(false);
    tbl.boolean('M26_hq').notNullable().defaultTo(false);
    tbl.boolean('M27_hq').notNullable().defaultTo(false);
    tbl.boolean('M28_hq').notNullable().defaultTo(false);
    tbl.boolean('M29_hq').notNullable().defaultTo(false);
    tbl.boolean('M30_hq').notNullable().defaultTo(false);
    tbl.boolean('M31_hq').notNullable().defaultTo(false);
    tbl.boolean('M1_local').notNullable().defaultTo(false);
    tbl.boolean('M2_local').notNullable().defaultTo(false);
    tbl.boolean('M3_local').notNullable().defaultTo(false);
    tbl.boolean('M4_local').notNullable().defaultTo(false);
    tbl.boolean('M5_local').notNullable().defaultTo(false);
    tbl.boolean('M6_local').notNullable().defaultTo(false);
    tbl.boolean('M7_local').notNullable().defaultTo(false);
    tbl.boolean('M8_local').notNullable().defaultTo(false);
    tbl.boolean('M9_local').notNullable().defaultTo(false);
    tbl.boolean('M10_local').notNullable().defaultTo(false);
    tbl.boolean('M11_local').notNullable().defaultTo(false);
    tbl.boolean('M12_local').notNullable().defaultTo(false);
    tbl.boolean('M13_local').notNullable().defaultTo(false);
    tbl.boolean('M14_local').notNullable().defaultTo(false);
    tbl.boolean('M15_local').notNullable().defaultTo(false);
    tbl.boolean('M16_local').notNullable().defaultTo(false);
    tbl.boolean('M17_local').notNullable().defaultTo(false);
    tbl.boolean('M18_local').notNullable().defaultTo(false);
    tbl.boolean('M19_local').notNullable().defaultTo(false);
    tbl.boolean('M20_local').notNullable().defaultTo(false);
    tbl.boolean('M21_local').notNullable().defaultTo(false);
    tbl.boolean('M22_local').notNullable().defaultTo(false);
    tbl.boolean('M23_local').notNullable().defaultTo(false);
    tbl.boolean('M24_local').notNullable().defaultTo(false);
    tbl.boolean('M25_local').notNullable().defaultTo(false);
    tbl.boolean('M26_local').notNullable().defaultTo(false);
    tbl.boolean('M27_local').notNullable().defaultTo(false);
    tbl.boolean('M28_local').notNullable().defaultTo(false);
    tbl.boolean('M29_local').notNullable().defaultTo(false);
    tbl.boolean('M30_local').notNullable().defaultTo(false);
    tbl.boolean('M31_local').notNullable().defaultTo(false);
  });

  await knex.schema.createTable('game_logs', (tbl) => {
    tbl.increments('id');
    // TODO:
  });

  await knex.schema.createTable('game_systems', (tbl) => {
    tbl.increments('id');
    tbl.boolean('S1').notNullable().defaultTo(true);
    tbl.boolean('S2').notNullable().defaultTo(true);
    tbl.boolean('S3').notNullable().defaultTo(true);
    tbl.boolean('S4').notNullable().defaultTo(true);
    tbl.boolean('S5').notNullable().defaultTo(true);
    tbl.boolean('S6').notNullable().defaultTo(true);
    tbl.boolean('S7').notNullable().defaultTo(true);
    tbl.boolean('S8').notNullable().defaultTo(true);
    tbl.boolean('S9').notNullable().defaultTo(true);
    tbl.boolean('S10').notNullable().defaultTo(true);
    tbl.boolean('S11').notNullable().defaultTo(true);
    tbl.boolean('S12').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('game', (tbl) => {
    tbl.string('id').notNullable();
    tbl.index('id');
    tbl.unique('id');
    tbl.enu('state', [
      'ASSESSMENT',
      'PREPARATION',
      'SIMULATION',
    ]).notNullable().defaultTo('PREPARATION');
    tbl.integer('poll').notNullable().defaultTo(0);
    tbl.integer('budget').notNullable().defaultTo(0);
    tbl.timestamp('started_at');
    tbl
      .integer('mitigations_id')
      .unsigned()
      .notNullable();
    tbl
      .foreign('mitigations_id')
      .references('id')
      .inTable('game_mitigations');
    tbl
      .integer('logs_id')
      .unsigned()
      .notNullable();
    tbl
      .foreign('logs_id')
      .references('id')
      .inTable('game_logs');
    tbl
      .integer('systems_id')
      .unsigned()
      .notNullable();
    tbl
      .foreign('systems_id')
      .references('id')
      .inTable('game_systems');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('game');
  await knex.schema.dropTableIfExists('game_mitigations');
  await knex.schema.dropTableIfExists('game_logs');
  await knex.schema.dropTableIfExists('game_systems');
  await knex.schema.dropTableIfExists('mitigation');
  await knex.schema.dropTableIfExists('system');
};
