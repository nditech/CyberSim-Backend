/* eslint no-param-reassign: "off", camelcase: "off", no-restricted-syntax: "off", guard-for-in: "off", no-await-in-loop: "off" */

const Airtable = require('airtable');
const yup = require('yup');
const { dbSchemas, airtableSchemas } = require('./migration_schemas');
const db = require('../models/db');

const locationMap = {
  'Local Branch': 'local',
  Headquarters: 'hq',
};

const typeMap = {
  Table: 'Table',
  Background: 'Background',
  'System Board': 'Board',
};

async function validate(schema, items = [], tableName) {
  try {
    return await yup
      .array()
      .of(schema)
      .validate(items, { stripUnknown: true, abortEarly: false });
  } catch (err) {
    err.validation = true;
    err.tableName = tableName;
    throw err;
  }
}

function fetchTable(base, tableName) {
  const allFields = [];

  return new Promise((resolve, reject) => {
    base(tableName)
      .select()
      .eachPage(
        (records, fetchNextPage) => {
          const fields = records.map((record) => ({
            ...record.fields,
            id: record.id,
          }));
          allFields.push(...fields);

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
          } else {
            validate(airtableSchemas[tableName], allFields, tableName)
              .then(resolve)
              .catch(reject);
          }
        },
      );
  });
}

async function saveToDb(tableName, items) {
  try {
    const validatedItems = await validate(
      dbSchemas[tableName],
      items,
      tableName,
      true,
    );
    await db(tableName).insert(validatedItems);
  } catch (err) {
    err.message =
      'There were deep SQL schema validation errors during the migration! Please contact the developers to fix them.';
    throw err;
  }
}

function addPartyLocation(locations) {
  return locations?.includes('hq') && locations?.includes('local')
    ? 'party'
    : locations?.[0];
}

async function migrate(apiKey, baseId) {
  // connect to the airtable instance
  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey,
  });

  const base = Airtable.base(baseId);

  // do a starting "fake" fetch to check if the API key and table id are correct
  await fetchTable(base, 'handbook_categories');

  // define arrays for junctions tables that must be added at the end of the migration
  const injectionResponse = [];
  const actionRole = [];

  const tables = await Promise.allSettled([
    // fetch the backing tables that do not exist in our sql database and are only needed for data transformation
    fetchTable(base, 'handbook_categories'),
    fetchTable(base, 'locations'),
    fetchTable(base, 'recommendations'),
    fetchTable(base, 'event_types'),
    // fetch main tables
    fetchTable(base, 'events'),
    fetchTable(base, 'purchased_mitigations'),
    fetchTable(base, 'responses'),
    fetchTable(base, 'systems'),
    fetchTable(base, 'roles'),
    fetchTable(base, 'actions'),
    fetchTable(base, 'curveballs'),
  ]);

  const errors = tables
    .filter((table) => table.status === 'rejected')
    .map((error) => error.reason);
  if (errors.length) {
    errors.message =
      'There were airtable schema errors during the migration! Please fix them inside your airtable.';
    throw errors;
  }

  const [
    rawHandbookCategories,
    rawLocations,
    rawRecommendations,
    rawEventTypes,
    injections,
    mitigations,
    responses,
    systems,
    roles,
    actions,
    curveballs,
  ] = tables.map((table) => table.value);

  //  process the backing tables
  const handbookCategories = rawHandbookCategories.reduce(
    (obj, { name, id }) => ({ ...obj, [id]: name }),
    {},
  );

  const locations = rawLocations.reduce(
    (obj, { name, id }) => ({
      ...obj,
      [id]: locationMap[name],
    }),
    {},
  );

  const recommendations = rawRecommendations.reduce(
    (obj, { name, handbook_category, id }) => ({
      ...obj,
      [id]: `${handbookCategories[handbook_category]}: ${name}`,
      id,
    }),
    {},
  );

  const eventTypes = rawEventTypes.reduce(
    (obj, { name, id }) => ({
      ...obj,
      [id]: typeMap[name],
    }),
    {},
  );

  // process events
  injections.forEach((injection) => {
    injection.location = locations[injection.locations];
    injection.recommendations = recommendations[injection.recommendations];
    injection.type = eventTypes[injection.event_types] || 'Board';
    injection.followup_injecion = injection.followup_event;
    injection.trigger_time *= 1000;
  });
  injections.forEach(({ id, response = [] }) => {
    response.forEach((responseId) =>
      injectionResponse.push({
        injection_id: id,
        response_id: responseId,
      }),
    );
  });

  // process mitigations
  mitigations.forEach((mitigation) => {
    mitigation.hq_cost = mitigation.cost;
    mitigation.local_cost = mitigation.cost;
    const mitigationLocations = mitigation.locations.map((id) => locations[id]);
    mitigation.is_hq = mitigationLocations.includes('hq');
    mitigation.is_local = mitigationLocations.includes('local');
  });

  // process responses
  responses.forEach((response) => {
    response.location = addPartyLocation(
      response.locations.map((id) => locations[id]),
    );
    response.mitigation_type = addPartyLocation(
      response.mitigation_location?.map((id) => locations[id]),
    );
    response.required_mitigation_type = addPartyLocation(
      response.required_mitigation_location?.map((id) => locations[id]),
    );
  });

  // process systems
  systems.forEach((system) => {
    system.type = addPartyLocation(system.locations.map((id) => locations[id]));
  });

  // process actions
  actions.forEach((action) => {
    action.type = locations[action.locations];
  });
  actions.forEach(({ id, role = [] }) => {
    role.forEach((roleId) =>
      actionRole.push({ action_id: id, role_id: roleId }),
    );
  });

  // clean the current db and re-migrate it
  await db.migrate.rollback();
  await db.migrate.latest();

  // add all the data to the db
  // sequential processing is important here as some tables rely on data from other tables to be already there
  await saveToDb('injection', injections);
  await saveToDb('mitigation', mitigations);
  await saveToDb('response', responses);
  await saveToDb('system', systems);
  await saveToDb('role', roles);
  await saveToDb('action', actions);
  await saveToDb('curveball', curveballs);
  await saveToDb('injection_response', injectionResponse);
  await saveToDb('action_role', actionRole);
}

module.exports = migrate;
