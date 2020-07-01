require('dotenv/config');

process.env.DB_DATABASE = `${process.env.DB_DATABASE}_test`;

module.exports = {};
