const db = require('./db');

const getActions = async () => {
  const records = await db('action').select('action.*', 'r.roles').joinRaw(`
    LEFT JOIN (
      SELECT ar.action_id, array_agg(role.name) AS roles
      FROM action_role ar
      LEFT JOIN role
      ON role.id = ar.role_id
      GROUP BY ar.action_id
    ) r ON r.action_id = action.id
  `);
  return records;
};

module.exports = {
  getActions,
};
