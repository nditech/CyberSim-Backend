const db = require('../models/db');
const { up, down } = require('../../data/migrations/20200611095430_initial');
const {
  seed: createInjections,
} = require('../../data/seeds/static_1_injection');
const {
  seed: createMitigations,
} = require('../../data/seeds/static_2_mitigation');
const { seed: createResponses } = require('../../data/seeds/static_3_response');
const { seed: createSystems } = require('../../data/seeds/static_4_system');
const {
  seed: createInjectionResponses,
} = require('../../data/seeds/static_5_injection_response');
const { seed: createRoles } = require('../../data/seeds/static_6_role');
const { seed: createActions } = require('../../data/seeds/static_7_action');
const {
  seed: createActionRoles,
} = require('../../data/seeds/static_8_action_role');

const setUpDatabase = async () => {
  await down(db);
  await up(db);

  await createInjections(db);
  await createMitigations(db);
  await createResponses(db);
  await createSystems(db);
  await createInjectionResponses(db);
  await createRoles(db);
  await createActions(db);
  await createActionRoles(db);
};

module.exports = {
  setUpDatabase,
};
