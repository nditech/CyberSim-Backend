require('dotenv/config');

process.env.DB_URL = `${process.env.DB_URL}_test`;

module.exports = {};
