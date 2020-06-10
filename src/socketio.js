const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const db = require('./models/db');

module.exports = (http) => {
  const io = socketio(http);

  io.on(SocketEvents.CONNECT, (socket) => {
    logger.info('A facilitator connected');

    socket.on(SocketEvents.CREATEGAME, async (id, callback) => {
      logger.info('[server](CREATEGAME): %s', JSON.stringify(id));
      try {
        const [game] = await db('game').insert({
          id,
          state: 'PREPARATION',
          poll: 100,
          budget: 50000,
          systems: {
            computer: false,
          },
          allocated_budget: 0,
        }, [
          'id',
          'state',
          'poll',
          'budget',
          'systems',
          'allocated_budget',
        ]);
        callback({ game });
      } catch (_) {
        console.log(_);
        callback({ error: 'Game id already exists!' });
      }
    });

    socket.on(SocketEvents.JOINGAME, async (id, callback) => {
      logger.info('[server](JOINGAME): %s', JSON.stringify(id));
      try {
        const game = await db('game').where({ id }).first();
        if (!game) {
          callback({ error: 'Game not found!' });
        }
        callback({ game });
      } catch (_) {
        callback({ error: 'Server error!' });
      }
    });

    socket.on(SocketEvents.DISCONNECT, () => {
      logger.info('Client disconnected');
    });
  });

  return io;
};
