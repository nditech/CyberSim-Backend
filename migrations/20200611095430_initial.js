exports.up = async (knex) => {
  await knex.schema.createTable('system', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('name').notNullable();
    tbl.string('description');
    tbl.enu('type', ['hq', 'party', 'local']).notNullable();
  });

  await knex.schema.createTable('mitigation', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('description').notNullable();
    tbl.integer('hq_cost');
    tbl.integer('local_cost');
    tbl.boolean('is_hq').notNullable();
    tbl.boolean('is_local').notNullable();
    tbl
      .enu('category', [
        'Operation',
        'National party voter database',
        'National party website',
        'Accounts',
        'Devices',
      ])
      .notNullable();
  });

  await knex.schema.createTable('response', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('description').notNullable();
    tbl.integer('cost');
    tbl.enu('location', ['hq', 'local', 'party']).notNullable();
    // use mitigation costs of mitigation_id if no (no means null not 0) cost specified above
    tbl.enu('mitigation_type', ['hq', 'local', 'party']);
    tbl.string('mitigation_id');
    tbl.foreign('mitigation_id').references('id').inTable('mitigation');
    // Restore system at game state on response made
    tbl.specificType('systems_to_restore', 'text ARRAY'); // Switch these systems to TRUE
    tbl.string('required_mitigation'); // ALLOW response if requirement met with given type below
    tbl.enu('required_mitigation_type', ['hq', 'local', 'party']);
  });

  await knex.schema.createTable('injection', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('title').notNullable();
    tbl.string('description').notNullable();
    tbl.string('recommendations');
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
    tbl.string('followup_injecion');
    tbl.foreign('followup_injecion').references('id').inTable('injection');
  });

  // MANY injection_response to MANY injection
  await knex.schema.createTable('injection_response', (tbl) => {
    tbl.increments('id');
    tbl.string('injection_id').notNullable();
    tbl.string('response_id').notNullable();
    tbl.foreign('injection_id').references('id').inTable('injection');
    tbl.foreign('response_id').references('id').inTable('response');
  });

  await knex.schema.createTable('role', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('name').notNullable();
  });

  await knex.schema.createTable('action', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('description').notNullable();
    tbl.enu('type', ['hq', 'local']).notNullable();
    tbl.integer('cost').notNullable().defaultTo(0);
    tbl.integer('budget_increase').notNullable().defaultTo(0);
    tbl.decimal('poll_increase').notNullable().defaultTo(0);
    tbl.specificType('required_systems', 'text ARRAY');
  });

  await knex.schema.createTable('curveball', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl.string('description').notNullable();
    tbl.boolean('lose_all_budget').notNullable().defaultTo(false);
    tbl.integer('budget_change').notNullable().defaultTo(0);
    tbl.decimal('poll_change').notNullable().defaultTo(0);
  });

  // MANY actions to MANY roles
  await knex.schema.createTable('action_role', (tbl) => {
    tbl.increments('id');
    tbl.string('action_id').notNullable();
    tbl.string('role_id').notNullable();
    tbl.foreign('action_id').references('id').inTable('action');
    tbl.foreign('role_id').references('id').inTable('role');
  });

  await knex.schema.createTable('game', (tbl) => {
    tbl.string('id').primary().notNullable();
    tbl
      .enu('state', ['ASSESSMENT', 'PREPARATION', 'SIMULATION'])
      .notNullable()
      .defaultTo('PREPARATION');
    tbl.decimal('poll').notNullable().defaultTo(40);
    tbl.integer('budget').notNullable().defaultTo(7000);
    tbl.timestamp('started_at', { useTz: true });
    tbl.boolean('paused').notNullable().defaultTo(true);
    tbl.integer('millis_taken_before_started').notNullable().defaultTo(0);
  });

  // ONE game to MANY game_mitigation
  await knex.schema.createTable('game_mitigation', (tbl) => {
    tbl.increments('id').primary().notNullable();
    tbl.string('game_id').notNullable();
    tbl.foreign('game_id').references('id').inTable('game');
    tbl.string('mitigation_id').notNullable();
    tbl.foreign('mitigation_id').references('id').inTable('mitigation');
    tbl.enu('location', ['hq', 'local']).notNullable();
    tbl.boolean('state').notNullable().defaultTo(false);
    tbl.boolean('preparation').notNullable().defaultTo(false);
  });

  // ONE game to MANY game_system
  await knex.schema.createTable('game_system', (tbl) => {
    tbl.increments('id').primary().notNullable();
    tbl.string('game_id').notNullable();
    tbl.foreign('game_id').references('id').inTable('game');
    tbl.string('system_id').notNullable();
    tbl.foreign('system_id').references('id').inTable('system');
    tbl.boolean('state').notNullable().defaultTo(true);
  });

  // ONE game to MANY game_injection
  await knex.schema.createTable('game_injection', (tbl) => {
    tbl.increments('id');
    tbl.string('game_id').notNullable();
    tbl.foreign('game_id').references('id').inTable('game');
    tbl.string('injection_id').notNullable();
    tbl.foreign('injection_id').references('id').inTable('injection');
    tbl.specificType('correct_responses_made', 'text ARRAY');
    tbl.boolean('prevented').notNullable().defaultTo(false);
    tbl.boolean('delivered').notNullable().defaultTo(false);
    tbl.integer('delivered_at');
    tbl.integer('response_made_at');
  });

  // ONE game to MANY game_log
  // create logs based on these items, game_injection(.response_made_at), game.preparation_mitigations,
  await knex.schema.createTable('game_log', (tbl) => {
    tbl.increments('id');
    tbl.string('game_id').notNullable();
    tbl.foreign('game_id').references('id').inTable('game');
    tbl.integer('game_timer').notNullable().defaultTo(0);
    tbl
      .enu('type', [
        'Budget Item Purchase',
        'System Restore Action',
        'Campaign Action',
        'Game State Changed',
        'Curveball Event',
      ])
      .notNullable();
    tbl.string('descripition');
    tbl.string('mitigation_type'); // Budget Item Purchase
    tbl.string('mitigation_id'); // Budget Item Purchase
    tbl.foreign('mitigation_id').references('id').inTable('mitigation');
    tbl.string('response_id'); // System Restore Action
    tbl.foreign('response_id').references('id').inTable('response');
    tbl.string('action_id'); // Action
    tbl.foreign('action_id').references('id').inTable('action');
    tbl.string('curveball_id'); // Curveball
    tbl.foreign('curveball_id').references('id').inTable('curveball');
  });
};

exports.down = async (knex) => {
  // dynamic games
  await knex.schema.dropTableIfExists('game_injection');
  await knex.schema.dropTableIfExists('game_system');
  await knex.schema.dropTableIfExists('game_mitigation');
  await knex.schema.dropTableIfExists('game_log');
  await knex.schema.dropTableIfExists('game');
  // static data
  await knex.schema.dropTableIfExists('curveball');
  await knex.schema.dropTableIfExists('system');
  await knex.schema.dropTableIfExists('injection_response');
  await knex.schema.dropTableIfExists('response');
  await knex.schema.dropTableIfExists('injection');
  await knex.schema.dropTableIfExists('mitigation');
  await knex.schema.dropTableIfExists('action_role');
  await knex.schema.dropTableIfExists('role');
  await knex.schema.dropTableIfExists('action');
};
