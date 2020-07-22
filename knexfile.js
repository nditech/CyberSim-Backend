require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: process.env.DB_URL,
  pool: {
    idleTimeoutMillis: 300000,
  },
  migrations: {
    directory: './data/migrations',
  },
  seeds: { directory: './data/seeds' },
};
