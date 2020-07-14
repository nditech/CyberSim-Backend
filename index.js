const { createServer } = require('http');
const { promisify } = require('util');

const db = require('./src/models/db');
const app = require('./src/app');
const createSocket = require('./src/socketio');
const logger = require('./src/logger');

const checkEnviroment = async () => {
  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV must be set!');
  }

  if (process.env.NODE_ENV === 'development') {
    await db.migrate.down();
    await db.migrate.up();
    await db.seed.run();
    logger.info('Database successfully reseted');
  } else {
    await db.migrate.latest();
  }
};

checkEnviroment()
  .then(() => {
    const port = process.env.PORT || 3001;
    const http = createServer(app);
    createSocket(http);
    const server = http.listen(port, () => {
      logger.info(`Server is running at port: ${port}`);
    });

    const serverClose = promisify(server.close).bind(server);

    let shuttingDown = false;
    const gracefulShutdown = async () => {
      logger.info('Got kill signal, starting graceful shutdown');
      if (shuttingDown) {
        return;
      }
      shuttingDown = true;
      try {
        if (server) {
          await serverClose();
        }
      } catch (err) {
        logger.error('Error happened during graceful shutdown', err);
        process.exit(1);
      }
      logger.info('Graceful shutdown finished');
      process.exit(0);
    };
    process.on('SIGTERM', gracefulShutdown);
  })
  .catch((err) => {
    logger.error('Enviroment check is unsuccessful', err);
    process.exit(1);
  });
