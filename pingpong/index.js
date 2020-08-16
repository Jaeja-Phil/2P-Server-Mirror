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
    if(Object.keys(roomUsers).length === 2){
      console.log('game start');

      setTimeout(() => {
        socket.emit('start', true);
        socket.broadcast.to(user.room).emit('start',false);
      }, 3000);
    }
    io.to(user.room).emit('loadUsers', roomUsers);
  });
  
  // mouse move
  socket.on('mouseMove', (x) => {
    console.log(x)
    //내화면
    // console.log(x);
    let user = getCurrentUser(socket.id);
    socket.emit('myMove', x);
    socket.broadcast.to(user.room).emit('rivalMove',x);
  });

  //점수 난 경우
  socket.on('score', (res) => {
    let user = getCurrentUser(socket.id);
    let users = getRoomUsers(user.room);
    // console.log(res);
    console.log(user.id + ' ' + res);
    user.score++;
    let scoreData = {}
    scoreData[users[Object.keys(users)[0]].username] = users[Object.keys(users)[0]].score
    scoreData[users[Object.keys(users)[1]].username] = users[Object.keys(users)[1]].score
    console.log(scoreData);

    console.log()

    io.to(user.room).emit('reset');
    
    //한 번만 실행될 수 있도록 변경
    setTimeout(() => {
      socket.emit('start', true);
      socket.broadcast.to(user.room).emit('start',false);
    }, 3000);
  })
  // 방 나가기
  socket.on('disconnect', () => {
    let user = userLeave(socket.id);
    console.log('leave');
    console.log(user);
  });
});
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
