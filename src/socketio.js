const socketio = require('socket.io');
const cron = require('node-cron');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const {
  createGame,
  getGame,
  changeMitigation,
  startSimulation,
  pauseSimulation,
  makeResponses,
  injectGames,
  changeGameInjectionDeliverance,
  makeNonCorrectInjectionResponse,
} = require('./models/game');

module.exports = (http) => {
  const io = socketio(http);

  // Check game injections every 5 seconds
  let injectionInProgress = false;
  cron.schedule('*/5 * * * * *', async () => {
    if (injectionInProgress) {
      return;
    }
    injectionInProgress = true;
    const games = await injectGames();
    injectionInProgress = false;
    games.forEach((game) => {
      io.in(game.id).emit(SocketEvents.GAMEUPDATED, game);
    });
  });

  io.on(SocketEvents.CONNECT, (socket) => {
    logger.info('Facilitator CONNECT');
    let gameId = null;

    socket.on(SocketEvents.DISCONNECT, () => {
      logger.info('Facilitator DISCONNECT');
    });

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
        logger.error('JOINGAME ERROR: %s', error);
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
        callback({ error: error.message });
      }
    });

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

    socket.on(SocketEvents.DELIVEREINJECTION, async ({ injectionId, delivered }, callback) => {
      logger.info('DELIVEREINJECTION: %s', JSON.stringify({ gameId, injectionId, delivered }));
      try {
        const game = await changeGameInjectionDeliverance({ gameId, injectionId, delivered });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on(SocketEvents.RESPONDTOINJECTION, async ({ injectionId, responseIds }, callback) => {
      logger.info('RESPONDTOINJECTION: %s', JSON.stringify({ gameId, injectionId, responseIds }));
      try {
        const game = await makeResponses({ gameId, injectionId, responseIds });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    socket.on(SocketEvents.NONCORRECTRESPONDTOINJECTION, async ({ injectionId }, callback) => {
      logger.info('NONCORRECTRESPONDTOINJECTION: %s', JSON.stringify({ gameId, injectionId }));
      try {
        const game = await makeNonCorrectInjectionResponse({ gameId, injectionId });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({ game });
      } catch (error) {
        callback({ error: error.message });
      }
    });
  });

  return io;
};
