const db = require('./db');

const getInjections = async () => {
  const records = await db('injection')
    .select('injection.*', 'r.responses')
    .orderBy('trigger_time').joinRaw(`
    LEFT JOIN (
      SELECT ir.injection_id, array_agg(to_json(response)) AS responses
      FROM injection_response ir
      LEFT JOIN response
      ON response.id = ir.response_id
      GROUP BY ir.injection_id
    ) r ON r.injection_id = injection.id
  `);
  return records;
};

module.exports = {
  getInjections,
};
