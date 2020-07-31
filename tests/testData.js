const dummyGame = {
  id: 'TestGame',
  state: 'PREPARATION',
  poll: 40,
  budget: 7000,
  started_at: null,
  paused: true,
  millis_taken_before_started: 0,
};

const dummyGameMitigations = [
  {
    id: 1,
    game_id: 'TestGame',
    mitigation_id: 'M1',
    location: 'hq',
    state: false,
    preparation: false,
  },
  {
    id: 2,
    game_id: 'TestGame',
    mitigation_id: 'M1',
    location: 'local',
    state: false,
    preparation: false,
  },
  {
    id: 3,
    game_id: 'TestGame',
    mitigation_id: 'M2',
    location: 'local',
    state: false,
    preparation: false,
  },
];
const dummyGameSystems = [
  { id: 1, game_id: 'TestGame', system_id: 'S1', state: true },
  { id: 2, game_id: 'TestGame', system_id: 'S2', state: true },
];

const dummyGameInjections = [
  {
    id: 1,
    injection_id: 'I1',
    game_id: 'TestGame',
    prevented: false,
    delivered: false,
    correct_responses_made: null,
    delivered_at: null,
    response_made_at: null,
  },
  {
    id: 2,
    injection_id: 'I2',
    game_id: 'TestGame',
    prevented: false,
    delivered: false,
    correct_responses_made: null,
    delivered_at: null,
    response_made_at: null,
  },
  {
    id: 3,
    injection_id: 'I3',
    game_id: 'TestGame',
    prevented: false,
    delivered: false,
    correct_responses_made: null,
    delivered_at: null,
    response_made_at: null,
  },
];

const staticActions = [
  {
    id: 'A1',
    description: 'Hold national campaign rally',
    type: 'hq',
    cost: 1000,
    budget_increase: 0,
    poll_increase: 5,
    required_systems: ['S1', 'S2'],
    roles: ['Candidate 1', 'Candidate 2'],
  },
  {
    id: 'A2',
    description: 'Hold national campaign rally',
    type: 'local',
    cost: 1000,
    budget_increase: 0,
    poll_increase: 5,
    required_systems: [],
    roles: ['Candidate 2'],
  },
];

const staticCurveballs = [
  {
    id: 'C4',
    description: 'Disaster',
    budget_change: -1000,
    poll_change: -10,
  },
  {
    id: 'C7',
    description: 'Miracle',
    budget_change: 1500,
    poll_change: 10,
  },
  {
    id: 'C8',
    description: 'Oh My God',
    lose_all_budget: true,
  },
];

const staticInjections = [
  {
    id: 'I1',
    title: 'Injection 1',
    description: 'Injection 1',
    trigger_time: 120000,
    location: 'local',
    type: 'Table',
    recipient_role: 'LB role',
    asset_code: '1',
    poll_change: -0.5,
    systems_to_disable: ['S1'],
    skipper_mitigation: 'M1',
    skipper_mitigation_type: 'hq',
    recommendations: 'Placeholder recommendation 1',
    responses: [
      {
        id: 'RP1',
        description: 'Change office lock at LB',
        cost: 0,
        location: 'local',
        mitigation_type: null,
        mitigation_id: null,
        systems_to_restore: ['S2'],
        required_mitigation: 'M1',
        required_mitigation_type: 'local',
      },
    ],
  },
  {
    id: 'I2',
    title: 'Injection 2',
    description: 'Injection 2',
    trigger_time: 240000,
    location: 'hq',
    type: 'Table',
    recipient_role: 'Hq role',
    asset_code: '2',
    poll_change: -0.5,
    systems_to_disable: [],
    skipper_mitigation: null,
    skipper_mitigation_type: null,
    recommendations: 'Placeholder recommendation 2',
    responses: [
      {
        id: 'RP2',
        description: 'Change office lock at LB',
        cost: null,
        location: 'local',
        mitigation_type: 'local',
        mitigation_id: 'M2',
        systems_to_restore: [],
        required_mitigation: null,
        required_mitigation_type: null,
      },
    ],
  },
  {
    id: 'I3',
    title: 'Injection 3',
    description: 'Injection 3',
    trigger_time: 340000,
    location: 'hq',
    type: 'Table',
    recipient_role: 'Hq role',
    asset_code: '3',
    poll_change: null,
    systems_to_disable: [],
    skipper_mitigation: 'M2',
    skipper_mitigation_type: 'local',
    recommendations: 'Placeholder recommendation 3',
    responses: null,
  },
];

module.exports = {
  dummyGame,
  dummyGameMitigations,
  dummyGameSystems,
  dummyGameInjections,
  staticInjections,
  staticActions,
  staticCurveballs,
};
