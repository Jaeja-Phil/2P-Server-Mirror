const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {web_server_url} = require('../url')
const fetch = require("node-fetch");
const {
  randomNum,
  getResult,
  gameStart,
  makelog,
  endGame,
  isGame
} = require('./utils/number');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let roomNum = {}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room, avatarId }) => {
    const user = userJoin(socket.id, username, room, avatarId);
  
    socket.join(user.room);
    console.log(getRoomUsers(user.room));

    setTimeout(() => {
      let roomUsers = getRoomUsers(user.room);
      if(roomUsers.length !== 2){
        io.to(user.room).emit('connectError');
        console.log('disconnect');
        socket.disconnect();
      }
    }, 1000)

    // io.to(user.room).emit('message', `${username}님이 들어오셨습니다`);

    // console.log(getRoomUsers(user.room))
    if(getRoomUsers(user.room).length === 2){
      console.log(roomNum[user.room])
      console.log('game start');

      if(!roomNum[user.room]){
        roomNum[user.room] = {}
      } 

      roomNum[user.room].ans = randomNum();
      // io.to(user.room).emit('start', {
      //   message: roomNum[user.room]
      // });
      console.log(
      gameStart(user.room, [getRoomUsers(user.room)[0].username, getRoomUsers(user.room)[1].username])
      )
      // io.to(user.room).emit('message', '게임이 시작됩니다.');
      let fst = Math.floor(Math.random()*2);
      roomNum[user.room].turn = fst;
      
      io.to(user.room).emit('turn', getRoomUsers(user.room)[roomNum[user.room].turn].username);
    }

    // Send users and room info
    // io.to(user.room).emit('loadUsers', {
    //   room: user.room,
    //   users: getRoomUsers(user.room)
    // });
    // console.log(getRoomUsers(user.room));
    const roomUsers = getRoomUsers(user.room);
    io.to(user.room).emit('loadUsers', roomUsers);

  });

  socket.on('endTurn', () => {
    let user = getCurrentUser(socket.id);
    let users = getRoomUsers(user.room);
    let room = user.room;
    let rival;
    if(users[0].username === user.username){
      rival = users[1].username;
    } else {
      rival = users[0].username;
    }
    // console.log(room);
    // console.log(user.username);
    // console.log('change');
    io.to(room).emit('res', {username: user.username, num: '----', res: '----'});
    let data ={arr:'----', res: '----'};
    let log = makelog(room, user.username, data);

    // console.log(log[user.username]);
    let cnt = 0;
    for(let i = 0; i < log[user.username].length; i++){
      if(log[user.username][i].arr === '----')cnt ++;
      
    }
    if(cnt >= 2){
      // io.to(room).emit('end', rival);
      endAll(rival, user.username, room, io);
    } else {
      !roomNum[room].turn ? roomNum[room].turn = 1 : roomNum[room].turn = 0;
      io.to(user.room).emit('turn', getRoomUsers(user.room)[roomNum[user.room].turn].username);
    }
    // console.log(roomNum[room].turn)

  });

  socket.on('sendEmoji', (data)=>{
    let user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('getEmoji', data);
  })
  //숫자 입력
  socket.on('submit', ({username, room, arr}) => {
    // console.log({username, arr});
    let user = getCurrentUser(socket.id);
    let users = getRoomUsers(user.room);

    let rival;
    if(users[0].username === user.username){
      rival = users[1].username;
    } else {
      rival = users[0].username;
    }

    if(getRoomUsers(room)[roomNum[room].turn].username === username){
      let res = getResult(roomNum[room].ans, arr);
      console.log(roomNum[room].ans);
      // console.log(res);
      // io.to(room).emit('message', `${username}님이 ${arr.join('')}을 입력했습니다`);
      // io.to(room).emit('message', `결과는 ${res} 입니다`);

      io.to(room).emit('res', {username: username, num: arr.join(''), res: res});
      let data ={arr:arr.join(''), res: res};
      let log = makelog(room, username, data);
      // console.log(log);

      if(log[getRoomUsers(user.room)[0].username].length === 5 && log[getRoomUsers(user.room)[1].username].length === 5){
        // io.to(room).emit('end', null);
        endAll(username, rival, room,io, true);
        // console.log('draw');
      }

      else if(res === '4S0B'){
        // io.to(room).emit('message', `${username}님이 승리하셨습니다`);
        // io.to(room).emit('end', username);
        endAll(username, rival, room, io);
        // io.to(room).emit('end', {winner: username, answer: roomNum[room].ans});
      } else {
        !roomNum[room].turn ? roomNum[room].turn = 1 : roomNum[room].turn = 0;
        io.to(user.room).emit('turn', getRoomUsers(user.room)[roomNum[user.room].turn].username);
      }
      // io.to(room).emit('score', {username: username, result: res, enter: arr.join('')}); //전광판

      
    } else {
      socket.emit('message', `당신차례가 아닙니다`)
    }
  })

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    // console.log(user);
    const users = getRoomUsers(user.room);
    let rival;

    if(users.length === 1){
      if(users[0].username && (users[0].username === user.username)){
        rival = users[1].username;
      } else {
        rival = users[0].username;
      }
      // io.to(user.room).emit('end', rival);
      endAll(rival, user.username, user.room, io);

    }
    if (user) {
      io.to(user.room).emit('message', `${user.username}님이 나가셨습니다`);
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }

    // console.log(getRoomUsers(user.room));
  });
});

function endAll (winner, loser, room,io, isDraw = false){
  let flag = true;
  io.to(room).emit('stop');
  for(let i = 0; i < getRoomUsers(room).length; i++){
    if(getRoomUsers(room)[i].isDone){
      console.log('break');
      flag = false;
    }
  }
  console.log(flag);
  if(roomNum[room] && flag){
    let result = {}
    result.score = {};
    result.gameCode = 3;
  
    if(isDraw){
      // console.log('draw');
      io.to(room).emit('end', null);
      result.score[winner] = 0;
      result.score[loser] = 0;
    } else {
      io.to(room).emit('end', winner);
      result.score[winner] = 1;
      result.score[loser] = 0;
    }
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
    endGame(room);
    delete roomNum[room];
    for(let i = 0; i < getRoomUsers(room).length; i++){
      getRoomUsers(room)[i].isDone = true;
    }
  }
}

const PORT = process.env.PORT || 3006;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
