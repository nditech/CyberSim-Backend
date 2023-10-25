const yup = require('yup');

const id = yup.string().required();
const singleRef = yup
  .string()
  .transform((array) => (Array.isArray(array) ? array[0] : array));
const multiRef = yup.array().of(yup.string());

// String constans
const locationsShort = ['hq', 'local'];
const locations = ['hq', 'local', 'party'];
const injectionTypes = ['Table', 'Background', 'Board'];

// Airtable DB schemas
const airtableSchemas = {
  purchased_mitigations_category: yup.object({
    id,
    name: yup.string(),
  }),
  handbook_categories: yup.object({
    id,
    name: yup.string(),
  }),
  locations: yup.object({
    id,
    name: yup.string(),
    location_code: yup.string().required().oneOf(locationsShort),
  }),
  dictionary: yup.object({
    id,
    word: yup.string().required(),
    synonym: yup.string().required(),
  }),
  recommendations: yup.object({
    id,
    name: yup.string(),
    handbook_category: singleRef,
  }),
  event_types: yup.object({
    id,
    name: yup.string(),
  }),
  events: yup.object({
    id,
    title: yup.string().required(),
    description: yup.string().required(),
    trigger_time: yup.number().integer().positive().required(),
    recommendations: singleRef,
    locations: singleRef,
    event_types: singleRef,
    role: singleRef,
    spreadsheet_id: yup.number().integer().positive(),
    poll_change: yup.number(),
    systems_to_disable: multiRef,
    response: multiRef,
    skipper_mitigation: singleRef,
    followup_event: singleRef,
  }),
  purchased_mitigations: yup.object({
    id,
    description: yup.string().required(),
    cost: yup.number(),
    category: singleRef.required(),
  }),
  responses: yup.object({
    id,
    description: yup.string().required(),
    cost: yup.number(),
    mitigation_id: singleRef,
    systems_to_restore: multiRef,
    required_mitigation: singleRef,
  }),
  systems: yup.object({
    id,
    name: yup.string().required(),
    description: yup.string(),
    locations: multiRef.required(),
  }),
  roles: yup.object({
    id,
    name: yup.string().required(),
  }),
  actions: yup.object({
    id,
    description: yup.string().required(),
    locations: singleRef.required(),
    cost: yup.number(),
    budget_increase: yup.number(),
    poll_increase: yup.number(),
    required_systems: multiRef,
    role: multiRef,
  }),
  curveballs: yup.object({
    id,
    description: yup.string().required(),
    poll_change: yup.number(),
    budget_change: yup.number(),
  }),
};

// PostgreSQL DB schemas
const dbSchemas = {
  injection: yup.object({
    id,
    recommendations: yup.string(),
    title: yup.string().required(),
    description: yup.string().required(),
    trigger_time: yup.number().integer().required(),
    location: yup.string().oneOf(locationsShort),
    type: yup.string().oneOf(injectionTypes).required(),
    recipient_role: yup.string(),
    poll_change: yup.number().integer(),
    systems_to_disable: multiRef,
    skipper_mitigation: yup.string(),
    followup_injecion: yup.string(),
    asset_code: yup.string(),
  }),
  mitigation: yup.object({
    id,
    description: yup.string().required(),
    cost: yup.number(),
    category: yup.string().required(),
  }),
  response: yup.object({
    id,
    description: yup.string().required(),
    cost: yup.number(),
    mitigation_id: yup.string(),
    systems_to_restore: multiRef,
    required_mitigation: yup.string(),
  }),
  system: yup.object({
    id,
    name: yup.string().required(),
    description: yup.string(),
    type: yup.string().oneOf(locations).required(),
  }),
  role: yup.object({
    id,
    name: yup.string().required(),
  }),
  location: yup.object({
    id,
    name: yup.string().required(),
    type: yup.string().oneOf(locationsShort).required(),
  }),
  dictionary: yup.object({
    id,
    word: yup.string().required(),
    synonym: yup.string().required(),
  }),
  action: yup.object({
    id,
    description: yup.string().required(),
    type: yup.string().oneOf(locationsShort).required(),
    cost: yup.number(),
    budget_increase: yup.number(),
    poll_increase: yup.number(),
    required_systems: multiRef,
  }),
  curveball: yup.object({
    id,
    description: yup.string().required(),
    poll_change: yup.number(),
    budget_change: yup.number(),
    loose_all_budget: yup.number(),
  }),
  injection_response: yup.object({
    injection_id: yup.string().required(),
    response_id: yup.string().required(),
  }),
  action_role: yup.object({
    action_id: yup.string().required(),
    role_id: yup.string().required(),
  }),
};

module.exports = {
  airtableSchemas,
  dbSchemas,
};
