const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const {
  createGame,
  getGame,
  changeMitigation,
  performAction,
  startSimulation,
  pauseSimulation,
  makeResponses,
  deliverGameInjection,
  makeNonCorrectInjectionResponse,
  performCurveball,
} = require('./models/game');

module.exports = (http) => {
  const io = socketio(http, {
    cors: { origin: '*' },
  });

  io.on(SocketEvents.CONNECT, (socket) => {
    logger.info('Facilitator CONNECT');
    let gameId = null;

    socket.on(SocketEvents.DISCONNECT, () => {
      logger.info('Facilitator DISCONNECT');
    });

    socket.on(
      SocketEvents.CREATEGAME,
      async (id, initialBudget, initialPollPercentage, callback) => {
        logger.info('CREATEGAME: %s', id);
        try {
          const game = await createGame(
            id,
            initialBudget,
            initialPollPercentage,
          );
          if (gameId) {
            await socket.leave(gameId);
          }
          await socket.join(id);
          gameId = id;
          callback({ game });
        } catch (_) {
          callback({ error: 'Game id already exists!' });
        }
      },
    );

    socket.on(SocketEvents.JOINGAME, async (id, _, __, callback) => {
      logger.info('JOINGAME: %s', id);
      try {
        const game = await getGame(id);
        if (!game) {
          callback({ error: 'Game not found!' });
        }
        if (gameId) {
          await socket.leave(gameId);
        }
        await socket.join(id);
        gameId = id;
        callback({ game });
      } catch (error) {
        logger.error('JOINGAME ERROR: %s', error);
        callback({ error: 'Server error on join game!' });
      }
    });

    socket.on(
      SocketEvents.CHANGEMITIGATION,
      async ({ id: mitigationId, value: mitigationValue }, callback) => {
        logger.info(
          'CHANGEMITIGATION: %s',
          JSON.stringify({
            mitigationId,
            mitigationValue,
            gameId,
          }),
        );
        try {
          const game = await changeMitigation({
            mitigationId,
            mitigationValue,
            gameId,
          });
          io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
          callback({ game });
        } catch (error) {
          callback({ error: error.message });
        }
      },
    );

    socket.on(SocketEvents.STARTSIMULATION, async (callback) => {
      logger.info('STARTSIMULATION: %s', gameId);
      try {
        const game = await startSimulation(gameId);
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on(SocketEvents.PAUSESIMULATION, async (callback) => {
      logger.info('PAUSESIMULATION: %s', gameId);
      try {
        const game = await pauseSimulation({ gameId });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on(SocketEvents.FINISHSIMULATION, async (callback) => {
      logger.info('FINISHSIMULATION: %s', gameId);
      try {
        const game = await pauseSimulation({ gameId, finishSimulation: true });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on(SocketEvents.RESTORESYSTEM, async ({ responseId }, callback) => {
      logger.info('RESTORESYSTEM: %s', JSON.stringify({ responseId, gameId }));
      try {
        const game = await makeResponses({ responseIds: [responseId], gameId });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on(
      SocketEvents.DELIVERINJECTION,
      async ({ injectionId }, callback) => {
        logger.info(
          'DELIVERINJECTION: %s',
          JSON.stringify({ gameId, injectionId }),
        );
        try {
          const game = await deliverGameInjection({
            gameId,
            injectionId,
          });
          io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
          callback({ game });
        } catch (error) {
          callback({ error: error.message });
        }
      },
    );

    socket.on(
      SocketEvents.RESPONDTOINJECTION,
      async ({ injectionId, responseIds, customResponse }, callback) => {
        logger.info(
          'RESPONDTOINJECTION: %s',
          JSON.stringify({ gameId, injectionId, responseIds, customResponse }),
        );
        try {
          const game = await makeResponses({
            gameId,
            injectionId,
            responseIds,
            customResponse,
          });
          io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
          callback({ game });
        } catch (error) {
          callback({ error: error.message });
        }
      },
    );

    socket.on(
      SocketEvents.NONCORRECTRESPONDTOINJECTION,
      async ({ injectionId, customResponse }, callback) => {
        logger.info(
          'NONCORRECTRESPONDTOINJECTION: %s',
          JSON.stringify({ gameId, injectionId, customResponse }),
        );
        try {
          const game = await makeNonCorrectInjectionResponse({
            gameId,
            injectionId,
            customResponse,
          });
          io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
          callback({ game });
        } catch (error) {
          callback({ error: error.message });
        }
      },
    );

    socket.on(SocketEvents.PERFORMACTION, async ({ actionId }, callback) => {
      logger.info('PERFORMACTION: %s', JSON.stringify({ gameId, actionId }));
      try {
        const game = await performAction({
          gameId,
          actionId,
        });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on(
      SocketEvents.PERFORMCURVEBALL,
      async ({ curveballId }, callback) => {
        logger.info(
          'PERFORMCURVEBALL: %s',
          JSON.stringify({ gameId, curveballId }),
        );
        try {
          const game = await performCurveball({
            gameId,
            curveballId,
          });
          io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
          callback({ game });
        } catch (error) {
          callback({ error: error.message });
        }
      },
    );
  });

  return io;
};
