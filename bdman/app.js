const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { userJoin, userLeave, getRoomUsers, getCurrentUser, endGame } = require('./utils/users');

const fetch = require("node-fetch");
const {web_server_url} = require('../url')

// Run when client connects
io.on('connection', (socket) => {
  //방 입장시
  socket.on('joinRoom', ({username, room, avatarId}) => {
    const user = userJoin(socket.id, username, room, avatarId);
    const roomUsers = getRoomUsers(user.room);

    socket.join(user.room);
    // console.log(Object.keys(roomUsers).length);
    // console.log(roomUsers);
    if(Object.keys(roomUsers).length === 2){
      console.log('game start');

      // setTimeout(() => {
      //   socket.emit('start', true);
      //   socket.broadcast.to(user.room).emit('start',false);
      // }, 3000);
    }
    io.to(user.room).emit('loadUsers', roomUsers);

    setTimeout(() => {
      if(Object.keys(roomUsers).length !== 2){
        io.to(user.room).emit('connectError');
        console.log('disconnect');
        socket.disconnect();
      }
    }, 3000)
  });
  socket.on('sendEmoji', (data)=>{
    let user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('getEmoji', data);
  })

  socket.on('moveLeft', () => {
    let user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('moveLeft');
  });
  socket.on('moveRight', () => {
    let user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('moveRight');
  });

  // mouse move
  socket.on('shot', (x) => {
    console.log(x)
    //내화면
    // console.log(x);
    let user = getCurrentUser(socket.id);
    socket.emit('myShot', x);
    socket.broadcast.to(user.room).emit('rivalShot',x);
  });

  //점수 난 경우
  socket.on('score', (res) => {
    let user = getCurrentUser(socket.id);
    let users = getRoomUsers(user.room);
    console.log(user.username+ ' '+ res);
    // socket.emit('myShot', res);
    socket.broadcast.to(user.room).emit('hit',res);
    if(res === 0){
      let usersID = Object.keys(users);
      if(users[usersID[0]].username && (users[usersID[0]].username === user.username)){
        rival = users[usersID[1]].username;
      } else {
        rival = users[usersID[0]].username;
      }

      let result = {};
      result.score = {};
      result.gameCode = 2;

      result.score[user.username] = 1;
      result.score[rival] = 0;

      console.log(result);
      fetch(`${web_server_url}/users/mypage`, {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(result)
      })
        // .then(result => console.log(result))
        .catch(err => console.log(err));
      io.to(user.room).emit('end', user.username); 
      console.log(user.username + ' win!'); 

      users.isDone = true;
    }
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    // let room;

    if (user) {
      const users = getRoomUsers(user.room);
      let usersID = Object.keys(users);
      let rival;
      // console.log(Object.keys(users).length);
      console.log(users.isDone);
      if (usersID.length === 1 && !users.isDone) {
        console.log('gg')
        if (users[usersID[0]].username && (users[usersID[0]].username === user.username)) {
          rival = users[usersID[1]].username;
        } else {
          rival = users[usersID[0]].username;
        }
        io.to(user.room).emit('end', rival);
        // endAll(rival, user.username, user.room, io);

        let result = {};
        result.score = {};
        result.gameCode = 2;

        result.score[user.username] = 0;
        result.score[rival] = 1;

        console.log(result);
        fetch(`${web_server_url}/users/mypage`, {
          method: 'post',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify(result)
        })
          // .then(result => console.log(result))
          .catch(err => console.log(err));
      }
      endGame(user.room);

    }
    

    console.log('leave');
    if (user) {
      io.to(user.room).emit('message', `${user.username}님이 나가셨습니다`);
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      }); 
    }

  });

});
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
