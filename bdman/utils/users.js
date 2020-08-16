const rooms = {};

// Join user to chat
function userJoin(id, username, room) {
  let user = {
    id: id,
    username: username,
    room: room,
    score: 0
  }
  if(!rooms[room]) rooms[room] = {};
  if(!rooms[room][id]){
    rooms[room][id] = user;
  }
  // console.log(rooms);
  return user;
}

// User leaves chat
function userLeave(id) {
  let tmp;
  for(let k in rooms){
    if(rooms[k][id]){
      tmp = rooms[k][id];
      delete rooms[k][id];
    }
  }
  return tmp;
}

function getCurrentUser(id){
  let tmp;
  for(let k in rooms){
    if(rooms[k][id]){
      tmp = rooms[k][id];
    }
  }
  return tmp;
}

// Get room users
function getRoomUsers(room) {
  return rooms[room];
}

module.exports = {
  userJoin,
  userLeave,
  getRoomUsers,
  getCurrentUser,
};
