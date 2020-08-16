/*eslint-disable*/
const { createServer } = require('http');
const express = require('express');
const app = express();
const httpServer = createServer(app);
const io = require('socket.io')(httpServer);
const fetch = require('node-fetch');

const { web_server_url } = require('../url');

const { gameJoin, getCurrentScores, getCurrentGame, leaveGame } = require('./utils/games');

const PORT = 3009;

io.on('connect', (socket) => {
  socket.on('gameStart', (username, gameRoomId, avatarId) => {
    let [game, refreshed] = gameJoin(username, gameRoomId, socket.id, avatarId);
    socket.join(gameRoomId);
    io.to(gameRoomId).emit('init', [game.usernames, game.currentMole, game.score, game.avatarId]);
    if (game.usernames.length === 2 && refreshed === false) {
      const moleTimer = setInterval(() => {
        let randomIndex = Math.floor(Math.random() * 16);
        io.to(gameRoomId).emit('generateMole', randomIndex);
        getCurrentGame(gameRoomId).currentMole += 1;
      }, 3000);
      setTimeout(() => {
        clearInterval(moleTimer);
        let scores = getCurrentScores(gameRoomId);
        let player = Object.keys(scores);
        let winner =
          scores[player[0]] > scores[player[1]]
            ? player[0]
            : scores[player[0]] < scores[player[1]]
            ? player[1]
            : 'tie';
        io.to(gameRoomId).emit('gameover', winner);
        let result = {};
        result.score = scores;
        result.gameCode = 1;

        fetch(`${web_server_url}/users/mypage`, {
          method: 'post',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(result),
        });
        leaveGame(gameRoomId);
      }, 10000);
    }
  });

  socket.on('moleClick', (data) => {
    let { username, index, currentMole, gameRoomId } = data;
    let currentGame = getCurrentGame(gameRoomId);
    const [player1, player2] = Object.keys(currentGame.score);
    if (currentGame.currentMole === currentMole) {
      currentGame.score[username] += 10;
      const result = { score: {} };
      result.score[player1] = currentGame.score[player1];
      result.score[player2] = currentGame.score[player2];
      result.index = index;
      io.to(gameRoomId).emit('updateScore', result);
    }
  });

  socket.on('activateGif', (data) => {
    const { gameRoomId, gif } = data;
    socket.broadcast.to(gameRoomId).emit('opponentGif', gif);
  });
});

httpServer.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
