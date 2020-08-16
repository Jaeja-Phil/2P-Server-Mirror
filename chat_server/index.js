const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
/*
  id: socketId,
  userInfo: {
    username: //..?nickname
    avatar:
    isReady:
  },
  room: {
    gameCode:
    roomId:
  }
*/

// Run when client connects
io.on('connection', (socket) => {
  //방 입장시
  socket.on('joinRoom', ({ userInfo, room }) => {
    const user = userJoin(socket.id, userInfo, room);
    const roomUsers = getRoomUsers(user.room.roomId);
    socket.join(user.room.roomId);
    socket.emit('systemMessage', { username: 'System', text: '대기방에 입장하셨습니다!' });
    socket.broadcast.to(user.room.roomId).emit('systemMessage', {
      username: 'System',
      text: `${user.userInfo.username} has joined the chat`,
    });

    io.to(user.room.roomId).emit('loadUsers', roomUsers);
  });
  // 채팅
  socket.on('sendMessage', (msg, username) => {
    const user = getCurrentUser(username);
    socket.broadcast.to(user.room.roomId).emit('receiveMessage', msg);
  });
  // 준비 버튼
  socket.on('ready', (username) => {
    //isReady 상태 변경
    const user = getCurrentUser(username);
    user.userInfo.isReady = !user.userInfo.isReady; //반전

    //현재 준비상태 전송
    socket.broadcast.to(user.room.roomId).emit('readyState', user.userInfo.username);

    const roomUsers = getRoomUsers(user.room.roomId);
    if (roomUsers[0].userInfo.isReady && roomUsers[1].userInfo.isReady) {
      io.to(user.room.roomId).emit('systemMessage', { username: 'System', text: 'gameStart!' });
    }
  });
  socket.on('leave', () => {
    const user = userLeave(socket.id);
    const roomUsers = getRoomUsers(user.room.roomId);

    if (user.isHost) {
      // when host left
      socket.leave(user.room.roomId);
      socket.broadcast.to(user.room.roomId).emit('deleteRoom');
    } else {
      // when guest left
      socket.leave(user.room.roomId);
      io.to(user.room.roomId).emit('loadUsers', roomUsers);
      socket.broadcast.to(user.room.roomId).emit('systemMessage', {
        username: 'System',
        text: `${user.userInfo.username} has left the chat`,
      });
    }
  });
  // 방 나가기
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      const roomUsers = getRoomUsers(user.room.roomId);
      io.to(user.room.roomId).emit('loadUsers', roomUsers);
      io.to(user.room.roomId).emit('systemMessage', {
        username: 'system',
        text: `${user.userInfo.username} has been disconnected`,
      });
    }
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
