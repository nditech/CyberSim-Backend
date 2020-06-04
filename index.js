const { createServer } = require('http');

const app = require('./src/app');
const createSocket = require('./src/socketio');
const logger = require('./src/logger');

const port = process.env.PORT || 3000;
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
  try {
    if (server) {
      await server.close();
    }
  } catch (err) {
    logger.error('Error happened during graceful shutdown', err);
    process.exit(1);
  }
  logger.info('Graceful shutdown finished');
  process.exit(0);
};
process.on('SIGTERM', gracefulShutdown);
