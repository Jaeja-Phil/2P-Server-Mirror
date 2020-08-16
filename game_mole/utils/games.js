/*eslint-disable*/

const games = [];

// Join game
function gameJoin(nickname, gameRoomId, socketId, avatarId) {
  let game = {
    gameRoomId,
    usernames: [],
    socketId: [],
    avatarId: {},
    currentMole: 0,
    score: {},
  };
  if (!games.find((gameRoomId) => gameRoomId)) {
    game.usernames.push(nickname);
    game.score[nickname] = 0;
    game.socketId.push(socketId);
    game.avatarId[nickname] = avatarId;
    games.push(game);
    return [game, false];
  } else {
    if (games.find((gameRoomId) => gameRoomId).socketId.length === 2) {
      return [games.find((gameRoomId) => gameRoomId), true];
    }
    games.find((gameRoomId) => gameRoomId).usernames.push(nickname);
    games.find((gameRoomId) => gameRoomId).score[nickname] = 0;
    games.find((gameRoomId) => gameRoomId).socketId.push(socketId);
    games.find((gameRoomId) => gameRoomId).avatarId[nickname] = avatarId;
    return [games.find((gameRoomId) => gameRoomId), false];
  }
}

// Get current users
function getCurrentScores(gameRoomId) {
  return getCurrentGame(gameRoomId).score;
}

function getCurrentGame(gameRoomId) {
  return games.find((gameRoomId) => gameRoomId);
}

function leaveGame(gameRoomId) {
  games.splice(
    games.findIndex((gameRoomId) => gameRoomId),
    1
  );
}

module.exports = {
  gameJoin,
  getCurrentGame,
  getCurrentScores,
  leaveGame,
};
