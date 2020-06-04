const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');

module.exports = (http) => {
  const io = socketio(http);

  io.on(SocketEvents.CONNECT, (socket) => {
    logger.info('a user connected');

    socket.on(SocketEvents.MESSAGE, (message) => {
      logger.info('[server](message): %s', JSON.stringify(message));
      io.emit('message', message);
    });

    socket.on(SocketEvents.DISCONNECT, () => {
      logger.info('Client disconnected');
    });
  });

  return io;
};
