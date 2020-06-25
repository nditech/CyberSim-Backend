const db = require('./db');

// TODO: write tests for these functions

const getResponseWithCost = (responseWithMitigationCosts) => {
  const { hqMitCost, localMitCost, ...response } = responseWithMitigationCosts;
  if (response.cost !== null) {
    return response;
  }
  switch (response.mitigation_type) {
    case 'local':
      return { ...response, cost: localMitCost || 0 };
    case 'hq':
      return { ...response, cost: hqMitCost || 0 };
    default:
      return { ...response, cost: (hqMitCost || 0) + (localMitCost || 0) };
  }
};

const getResponse = async (responseId) => {
  const response = await db('response')
    .select(
      'response.*',
      'mitigation.hq_cost as hqMitCost',
      'mitigation.local_cost as localMitCost',
    )
    .leftOuterJoin('mitigation', 'response.mitigation_id', 'mitigation.id')
    .where({ 'response.id': responseId })
    .first();

  return getResponseWithCost(response);
};

const getResponses = async () => {
  const records = await db('response')
    .select(
      'response.*',
      'mitigation.hq_cost as hqMitCost',
      'mitigation.local_cost as localMitCost',
    )
    .leftOuterJoin('mitigation', 'response.mitigation_id', 'mitigation.id');
  return records.map((response) => getResponseWithCost(response));
};

module.exports = {
  getResponses,
  getResponse,
};
