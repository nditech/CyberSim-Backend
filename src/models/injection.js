const db = require('./db');

const getInjections = async () => {
  const records = await db('injection')
    .select(
      'injection.*',
      'r.responses',
    )
    .joinRaw(`
    LEFT JOIN (
      SELECT ir.injection_id, array_agg(ir.response_id) AS responses FROM injection_response ir GROUP BY ir.injection_id
    ) r ON r.injection_id = injection.id
  `);
  return records;
};

module.exports = {
  getInjections,
};
