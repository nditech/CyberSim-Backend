exports.up = async (knex) => {
  // #region GAME_MITIGATION TABLE
  const locationExists = await knex.schema.hasColumn(
    'game_mitigation',
    'location',
  );

  if (locationExists) {
    await knex.schema.alterTable('game_mitigation', (tbl) => {
      tbl.dropColumn('location');
    });
  }
  // #endregion

  // #region MITIGATION TABLE
  /**
   * Since 'mitigations' are only connected to injections (events),
   * replace 'hq_cost', 'local_cost', 'is_hq' and 'is_local' columns
   * with a single 'cost' column.
   */
  const hqCostExists = await knex.schema.hasColumn('mitigation', 'hq_cost');
  if (hqCostExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.dropColumn('hq_cost');
    });
  }

  const localCostExists = await knex.schema.hasColumn(
    'mitigation',
    'local_cost',
  );
  if (localCostExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.dropColumn('local_cost');
    });
  }

  const isHqExists = await knex.schema.hasColumn('mitigation', 'is_hq');
  if (isHqExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.dropColumn('is_hq');
    });
  }

  const isLocalExists = await knex.schema.hasColumn('mitigation', 'is_local');
  if (isLocalExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.dropColumn('is_local');
    });
  }

  // Add 'cost' if doesn't exist
  const costExists = await knex.schema.hasColumn('mitigation', 'cost');
  if (!costExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.integer('cost');
    });
  }
  // #endregion

  // #region RESPONSE TABLE
  const responseLocationExists = await knex.schema.hasColumn(
    'response',
    'location',
  );
  if (responseLocationExists) {
    await knex.schema.alterTable('response', (tbl) => {
      tbl.dropColumn('location');
    });
  }

  const responseMitigationTypeExists = await knex.schema.hasColumn(
    'response',
    'mitigation_type',
  );
  if (responseMitigationTypeExists) {
    await knex.schema.alterTable('response', (tbl) => {
      tbl.dropColumn('mitigation_type');
    });
  }

  const responseRequiredMitigationTypeExists = await knex.schema.hasColumn(
    'response',
    'required_mitigation_type',
  );
  if (responseRequiredMitigationTypeExists) {
    await knex.schema.alterTable('response', (tbl) => {
      tbl.dropColumn('required_mitigation_type');
    });
  }
  // #endregion

  // #region GAME_LOG
  const gameLogMitigationTypeExists = await knex.schema.hasColumn(
    'game_log',
    'mitigation_type',
  );
  if (gameLogMitigationTypeExists) {
    await knex.schema.alterTable('game_log', (tbl) => {
      tbl.dropColumn('mitigation_type');
    });
  }
  // #endregion
};

exports.down = async (knex) => {
  // #region GAME_MITIGATION TABLE
  const locationExists = await knex.schema.hasColumn(
    'game_mitigation',
    'location',
  );

  if (!locationExists) {
    await knex.schema.alterTable('game_mitigation', (tbl) => {
      tbl.enu('location', ['hq', 'local']).defaultTo('hq').notNullable();
    });
  }
  // #endregion

  // #region MITIGATION TABLE
  const hqCostExists = await knex.schema.hasColumn('mitigation', 'hq_cost');
  if (!hqCostExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.integer('hq_cost');
    });
  }

  const localCostExists = await knex.schema.hasColumn(
    'mitigation',
    'local_cost',
  );
  if (!localCostExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.integer('local_cost');
    });
  }

  const isHqExists = await knex.schema.hasColumn('mitigation', 'is_hq');
  if (!isHqExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.boolean('is_hq').defaultTo(true).notNullable();
    });
  }

  const isLocalExists = await knex.schema.hasColumn('mitigation', 'is_local');
  if (!isLocalExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.boolean('is_local').defaultTo(false).notNullable();
    });
  }

  // Add 'cost' if doesn't exist
  const costExists = await knex.schema.hasColumn('mitigation', 'cost');
  if (costExists) {
    await knex.schema.alterTable('mitigation', (tbl) => {
      tbl.dropColumn('cost');
    });
  }
  // #endregion

  // #region RESPONSE TABLE
  const responseLocationExists = await knex.schema.hasColumn(
    'response',
    'location',
  );
  if (!responseLocationExists) {
    await knex.schema.alterTable('response', (tbl) => {
      tbl
        .enu('location', ['hq', 'local', 'party'])
        .defaultTo('hq')
        .notNullable();
    });
  }

  const responseMitigationTypeExists = await knex.schema.hasColumn(
    'response',
    'mitigation_type',
  );
  if (!responseMitigationTypeExists) {
    await knex.schema.alterTable('response', (tbl) => {
      tbl.enu('mitigation_type', ['hq', 'local', 'party']);
    });
  }

  const responseRequiredMitigationTypeExists = await knex.schema.hasColumn(
    'response',
    'required_mitigation_type',
  );
  if (!responseRequiredMitigationTypeExists) {
    await knex.schema.alterTable('response', (tbl) => {
      tbl.enu('required_mitigation_type', ['hq', 'local', 'party']);
    });
  }
  // #endregion

  // #region GAME_LOG
  const gameLogMitigationTypeExists = await knex.schema.hasColumn(
    'game_log',
    'mitigation_type',
  );
  if (!gameLogMitigationTypeExists) {
    await knex.schema.alterTable('game_log', (tbl) => {
      tbl.string('mitigation_type');
    });
  }
  // #endregion
};
