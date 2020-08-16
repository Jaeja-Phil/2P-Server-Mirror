/* eslint-disable indent */
const moment = require('moment');

let moleRooms = {};
let pongRooms = {};
let cardRooms = {};

/*
{
	"roomId":,
	"gameCode":
	"password": 
	"roomName": 
	"roomOwner": 
	"userNum":
}
*/
module.exports = {
  makeroom: {
    post: async function (req, res) {
      try {
        let params = {
          roomId: moment().format('YYYYMMDDHHMMSS') + '-' + req.body.roomName,
          gameCode: req.body.gameCode,
          password: req.body.password || '',
          roomName: req.body.roomName,
          roomOwner: req.body.username,
          userNum: 1,
        };

        if (params.gameCode === '1') {
          //두더지 게임
          moleRooms[params.roomId] = params;
        } else if (params.gameCode === '2') {
          //핑퐁게임
          pongRooms[params.roomId] = params;
        } else if (params.gameCode === '3') {
          //추가게임
          cardRooms[params.roomId] = params;
        }

        res.status(200).json({ message: '방을 성공적으로 생성했습니다.', roomId: params.roomId });
      } catch (err) {
        console.error(err);
        res.status(501).json({ error: JSON.stringify(err) });
      }
    },
  },
  roomlist: {
    get: function (req, res) {
      try {
        let gameCode = req.query.gameCode;
        let getRooms;
        let rooms = [];

        if (gameCode === '1') {
          getRooms = moleRooms;
        } else if (gameCode === '2') {
          getRooms = pongRooms;
        } else if (gameCode === '3') {
          getRooms = cardRooms;
        }

        Object.keys(getRooms).forEach((k) => {
          let room = {};
          room.roomId = getRooms[k].roomId;
          room.gameCode = getRooms[k].gameCode;
          room.roomName = getRooms[k].roomName;
          room.roomOwner = getRooms[k].roomOwner;
          room.userNum = getRooms[k].userNum;
          room.isLocked = Boolean(getRooms[k].password);
          rooms.push(room);
        });
        // res.status(200).json(moleRooms);  //변경 필요
        res.status(200).json(rooms);
      } catch (err) {
        console.log(err);
        res.status(501).json({ error: JSON.stringify(err) });
      }
    },
  },
  joinroom: {
    post: function (req, res) {
      try {
        let roomId = req.body.roomId;
        let gameCode = req.body.gameCode;
        let password = req.body.password;

        if (gameCode === '1') {
          if (moleRooms[roomId].password === password || !moleRooms[roomId]) {
            if (moleRooms[roomId].userNum >= 2) {
              return res.json({ error: '방이 꽉 찼습니다!' });
            }
            moleRooms[roomId].userNum += 1;
            res.status(200).json({ message: '방 입장에 성공했습니다' });
          } else {
            res.status(409).json({ error: '비밀번호가 틀렸습니다' });
          }
        } else if (gameCode === '2') {
          if (pongRooms[roomId].password === password || !pongRooms[roomId]) {
            if (pongRooms[roomId].userNum >= 2) {
              return res.json({ error: '방이 꽉 찼습니다!' });
            }
            pongRooms[roomId].userNum += 1;
            res.status(200).json({ message: '방 입장에 성공했습니다' });
          } else {
            res.status(409).json({ error: '비밀번호가 틀렸습니다' });
          }
        } else if (gameCode === '3') {
          if (cardRooms[roomId].password === password || !cardRooms[roomId]) {
            if (cardRooms[roomId].userNum >= 2) {
              return res.json({ error: '방이 꽉 찼습니다!' });
            }
            cardRooms[roomId].userNum += 1;
            res.status(200).json({ message: '방 입장에 성공했습니다' });
          } else {
            res.status(409).json({ error: '비밀번호가 틀렸습니다' });
          }
        }
      } catch (err) {
        console.log(err);
        res.status(200).json({ error: '존재하지 않는 방입니다. 새로고침 버튼을 눌러주세요 :)' });
      }
    },
  },
  leaveroom: {
    post: function (req, res) {
      try {
        let roomId = req.body.roomId;
        let nickname = req.body.username;
        let gameCode = req.body.gameCode;
        if (gameCode === '1') {
          if (moleRooms[roomId].roomOwner === nickname) {
            delete moleRooms[roomId];
            res.status(200).json({ message: '방장이 방을 끝냈습니다' });
          } else {
            moleRooms[roomId].userNum -= 1;
            if (moleRooms[roomId].userNum <= 0) delete moleRooms[roomId];
            res.status(200).json({ message: '한 명이 방을 나갔습니다' });
          }
        } else if (gameCode === '2') {
          if (pongRooms[roomId].roomOwner === nickname) {
            delete pongRooms[roomId];
            res.status(200).json({ message: '방장이 방을 끝냈습니다' });
          } else {
            pongRooms[roomId].userNum -= 1;
            if (pongRooms[roomId].userNum <= 0) delete pongRooms[roomId];
            res.status(200).json({ message: '한 명이 방을 나갔습니다' });
          }
        } else if (gameCode === '3') {
          if (cardRooms[roomId].roomOwner === nickname) {
            delete cardRooms[roomId];
            res.status(200).json({ message: '방장이 방을 끝냈습니다' });
          } else {
            cardRooms[roomId].userNum -= 1;
            if (cardRooms[roomId].userNum <= 0) delete cardRooms[roomId];
            res.status(200).json({ message: '한 명이 방을 나갔습니다' });
          }
        } else {
          throw new Error('server Err');
        }
      } catch (err) {
        console.log(err, 'leaveroom error !@#!@#!@#');
        res.status(501).json({ error: JSON.stringify(err) });
      }
    },
  },
};
