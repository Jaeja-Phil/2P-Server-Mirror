const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { userJoin, userLeave, getRoomUsers, getCurrentUser } = require('./utils/users');

// Run when client connects
io.on('connection', (socket) => {
  //방 입장시
  socket.on('joinRoom', ({username, room}) => {
    const user = userJoin(socket.id, username, room);
    const roomUsers = getRoomUsers(user.room);

    socket.join(user.room);
    console.log(Object.keys(roomUsers).length);
    console.log(roomUsers);
    if(Object.keys(roomUsers).length === 2){
      console.log('game start');

      setTimeout(() => {
        socket.emit('start', true);
        socket.broadcast.to(user.room).emit('start',false);
      }, 3000);
    }
    io.to(user.room).emit('loadUsers', roomUsers);
  });
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
    // console.log(user.username+ ' '+ res);
    // socket.emit('myShot', res);
    socket.broadcast.to(user.room).emit('hit',res);
    if(res === 0){
      io.to(user.room).emit('end', user.username); 
      console.log(user.username + ' win!'); 
    }
  });

  // 방 나가기
  socket.on('disconnect', () => {
    let user = userLeave(socket.id);
    console.log('leave');
    console.log(user);
  });
});
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
