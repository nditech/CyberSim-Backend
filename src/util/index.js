const getTimeTaken = (
  { paused, millisTakenBeforeStarted, startedAt },
  currentTime,
) =>
  paused
    ? millisTakenBeforeStarted
    : (currentTime || Date.now()) -
      new Date(startedAt).getTime() +
      millisTakenBeforeStarted;

module.exports = {
  getTimeTaken,
};
