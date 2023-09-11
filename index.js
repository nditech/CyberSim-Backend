const { createServer } = require('http');

const db = require('./src/models/db');
const app = require('./src/app');
const createSocket = require('./src/socketio');
const logger = require('./src/logger');

const checkEnviroment = async () => {
  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV must be set!');
  }

  if (!process.env.DB_URL) {
    throw new Error('DB_URL must be set!');
  }

  if (process.env.NODE_ENV === 'test') {
    await db.migrate.rollback({}, true);
    await db.migrate.latest();
    await db.seed.run();
    logger.info('Database successfully reseted');
  } else {
    await db.migrate.latest();
  }
};

checkEnviroment()
  .then(() => {
    const port = process.env.PORT || 8080;
    const http = createServer(app);
    createSocket(http);
    const server = http.listen(port, () => {
      logger.info(`Server is running at port: ${port}`);
    });

    let shuttingDown = false;
    const gracefulShutdown = async () => {
      logger.info('Got kill signal, starting graceful shutdown');
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;

      server.close((err) => {
        if (err) {
          logger.error('Error happend during graceful shutdown: %s', err);
          process.exit(1);
        }
        logger.info('Graceful shutdown finished.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
  })
  .catch((err) => {
    logger.error('Enviroment check is unsuccessful: %s', err);
    process.exit(1);
  });
