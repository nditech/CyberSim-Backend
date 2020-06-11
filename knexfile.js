require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: process.env.DB_URL,
  migrations: {
    directory: './data/migrations',
  },
  seeds: { directory: './data/seeds' },
};
