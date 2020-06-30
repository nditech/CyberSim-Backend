
exports.up = async (knex) => {
  await knex.schema.createTable('system', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('name').notNullable();
    tbl.string('description');
    tbl.enu('type', [
      'hq',
      'party',
      'local',
    ]).notNullable();
  });

  await knex.schema.createTable('mitigation', (tbl) => {
    tbl.string('id').primary().notNullable();
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

  await knex.schema.createTable('response', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('description').notNullable();
    tbl.integer('cost');
    tbl.enu('location', ['hq', 'local', 'party']).notNullable();
    // use mitigation costs of mitigation_id if no (no means null not 0) cost specified above
    tbl.enu('mitigation_type', ['hq', 'local', 'party']);
    tbl.string('mitigation_id');
    tbl
      .foreign('mitigation_id')
      .references('id')
      .inTable('mitigation');
    // Restore system at game state on response made
    tbl.specificType('systems_to_restore', 'text ARRAY'); // Switch these systems to TRUE
    tbl.string('required_mitigation'); // ALLOW response if requirement met with given type below
    tbl.enu('required_mitigation_type', ['hq', 'local', 'party']);
  });

  await knex.schema.createTable('injection', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('title').notNullable();
    tbl.string('description').notNullable();
    tbl.integer('trigger_time').notNullable(); // in ms
    tbl.enu('location', ['hq', 'local']);
    tbl.enu('type', ['Table', 'Background', 'Board']).notNullable();
    tbl.string('recipient_role');
    tbl.string('asset_code');
    // These two values are only information for the game state to be checked upon injection
    tbl.string('skipper_mitigation'); // SKIP injection if mitigation is TRUE for the game in given type below
    tbl.enu('skipper_mitigation_type', ['hq', 'local', 'party']);
    // Emit these changes on game state when injection happens
    tbl.specificType('systems_to_disable', 'text ARRAY'); // Switch these systems to FALSE
    tbl.decimal('poll_change');
  });

  // MANY injection_response to MANY injection
  await knex.schema.createTable('injection_response', (tbl) => {
    tbl.increments('id');
    tbl.string('injection_id').notNullable();
    tbl.string('response_id').notNullable();
    tbl.foreign('injection_id').references('id').inTable('injection');
    tbl.foreign('response_id').references('id').inTable('response');
    tbl.string('injection_to_prevent');
    tbl.foreign('injection_to_prevent').references('id').inTable('injection');
  });

  await knex.schema.createTable('role', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('name').notNullable();
  });

  await knex.schema.createTable('action', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('description').notNullable();
    tbl.enu('type', [
      'hq',
      'local',
    ]).notNullable();
    tbl.integer('cost').notNullable().defaultTo(0);
    tbl.integer('budget_increase').notNullable().defaultTo(0);
    tbl.decimal('poll_increase').notNullable().defaultTo(0);
    tbl.specificType('authorized_roles', 'text ARRAY');
    tbl.specificType('required_systems', 'text ARRAY');
  });

  // ONE game to ONE game_mitigations
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
    tbl.boolean('M11_local').notNullable().defaultTo(false);
    tbl.boolean('M12_local').notNullable().defaultTo(false);
    tbl.boolean('M13_local').notNullable().defaultTo(false);
    tbl.boolean('M19_local').notNullable().defaultTo(false);
    tbl.boolean('M20_local').notNullable().defaultTo(false);
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

  // ONE game to ONE game_systems
  await knex.schema.createTable('game_systems', (tbl) => {
    tbl.increments('id');
    tbl.boolean('S1').notNullable().defaultTo(true);
    tbl.boolean('S2').notNullable().defaultTo(true);
    tbl.boolean('S3').notNullable().defaultTo(true);
    tbl.boolean('S4').notNullable().defaultTo(false); // TODO: switch back to true
    tbl.boolean('S5').notNullable().defaultTo(false); // TODO: switch back to true
    tbl.boolean('S6').notNullable().defaultTo(false); // TODO: switch back to true
    tbl.boolean('S7').notNullable().defaultTo(false); // TODO: switch back to true
    tbl.boolean('S8').notNullable().defaultTo(true);
    tbl.boolean('S9').notNullable().defaultTo(true);
    tbl.boolean('S10').notNullable().defaultTo(true);
    tbl.boolean('S11').notNullable().defaultTo(true);
    tbl.boolean('S12').notNullable().defaultTo(true);
  });

  await knex.schema.createTable('game', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.enu('state', [
      'ASSESSMENT',
      'PREPARATION',
      'SIMULATION',
    ]).notNullable().defaultTo('PREPARATION');
    tbl.decimal('poll').notNullable().defaultTo(0); // TODO: use a real default
    tbl.integer('budget').notNullable().defaultTo(50000); // TODO: use a real default
    tbl.timestamp('started_at', { useTz: true });
    tbl.boolean('paused').notNullable().defaultTo(true);
    tbl.integer('millis_taken_before_started').notNullable().defaultTo(0);
    tbl.integer('mitigations_id').unsigned().notNullable();
    tbl.foreign('mitigations_id').references('id').inTable('game_mitigations');
    tbl.integer('systems_id').unsigned().notNullable();
    tbl.foreign('systems_id').references('id').inTable('game_systems');
    tbl.specificType('prevented_injections', 'text ARRAY').notNullable().defaultTo('{}');
    tbl.boolean('every_injection_checked').notNullable().defaultTo(false);
  });

  // ONE game to MANY game_injection
  await knex.schema.createTable('game_injection', (tbl) => {
    tbl.increments('id');
    tbl.string('game_id').notNullable();
    tbl.foreign('game_id').references('id').inTable('game');
    tbl.string('injection_id').notNullable();
    tbl.foreign('injection_id').references('id').inTable('injection');
    tbl.specificType('correct_responses_made', 'text ARRAY');
    tbl.boolean('delivered').notNullable().defaultTo(false);
    tbl.boolean('response_made').notNullable().defaultTo(false);
  });

  // ONE game to MANY game_log
  await knex.schema.createTable('game_log', (tbl) => {
    tbl.increments('id');
    tbl.string('game_id').notNullable();
    tbl.foreign('game_id').references('id').inTable('game');
    // TODO:
    tbl.enu('type', [
      'injection happened', // game_injection id, why
      'injection prevented', // injection id, why
      'budget item purchased', // mitigation id
      'system related action', // response id
      'hq action', // action id
      'local action', // action id
    ]).notNullable();
  });
};

exports.down = async (knex) => {
  // dynamic
  await knex.schema.dropTableIfExists('game_injection');
  await knex.schema.dropTableIfExists('game_log');
  await knex.schema.dropTableIfExists('game');
  await knex.schema.dropTableIfExists('game_systems');
  await knex.schema.dropTableIfExists('game_mitigations');
  // static
  await knex.schema.dropTableIfExists('system');
  await knex.schema.dropTableIfExists('injection_response');
  await knex.schema.dropTableIfExists('response');
  await knex.schema.dropTableIfExists('injection');
  await knex.schema.dropTableIfExists('mitigation');
  await knex.schema.dropTableIfExists('role');
  await knex.schema.dropTableIfExists('action');
};
