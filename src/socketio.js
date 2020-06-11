const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const { createGame, getGame, changeMitigation } = require('./models/game');

module.exports = (http) => {
  const io = socketio(http);

  io.on(SocketEvents.CONNECT, (socket) => {
    logger.info('Facilitator CONNECT');
    let gameId = null;

    socket.on(SocketEvents.CREATEGAME, async (id, callback) => {
      logger.info('CREATEGAME: %s', id);
      try {
        const game = await createGame(id);
        if (gameId) {
          socket.leave(gameId);
        }
        socket.join(id);
        gameId = id;
        callback({ game });
      } catch (_) {
        callback({ error: 'Game id already exists!' });
      }
    });

    socket.on(SocketEvents.JOINGAME, async (id, callback) => {
      logger.info('JOINGAME: %s', id);
      try {
        const game = await getGame(id);
        if (!game) {
          callback({ error: 'Game not found!' });
        }
        if (gameId) {
          socket.leave(gameId);
        }
        socket.join(id);
        gameId = id;
        callback({ game });
      } catch (error) {
        logger.error('JOINGAME ERROR', error);
        callback({ error: 'Server error on join game!' });
      }
    });

    socket.on(SocketEvents.CHANGEMITIGATION, async ({
      id: mitigationId, type: mitigationType, value: mitigationValue,
    }, callback) => {
      logger.info('CHANGEMITIGATION: %s', JSON.stringify({
        mitigationId, mitigationType, mitigationValue, gameId,
      }));
      try {
        const game = await changeMitigation({
          mitigationId, mitigationType, mitigationValue, gameId, adjustBudget: true,
        });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        logger.error('CHANGEMITIGATION ERROR: %s', error);
        callback({ error: error.message });
      }
    });

    socket.on(SocketEvents.DISCONNECT, () => {
      logger.info('Facilitator DISCONNECT');
    });
  });

  return io;
};
