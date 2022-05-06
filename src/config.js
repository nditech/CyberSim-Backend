const config = {
  port: process.env.PORT,
  environment: process.env.NODE_ENV,
  migrationPassword: process.env.MIGRATION_PASSWORD ?? 'secret',
};

module.exports = config;
