const getTimeTaken = (
  {
    paused,
    millis_taken_before_started: millisTakenBeforeStarted,
    started_at: startedAt,
  },
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
