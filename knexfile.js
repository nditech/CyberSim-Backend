require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: {
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
  },
};
