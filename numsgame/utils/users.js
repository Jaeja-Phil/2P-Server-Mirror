const users = [];

// Join user to chat
function userJoin(id, username, room, avatarId) {
  const user = { id, username, room, avatarId };
  // console.log(isIn(username));
  let tmp = isIn(username);
  // console.log('--')
  // console.log(tmp);
  if(tmp){
    userLeave(tmp.id);
  }
  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function isIn(username){
  return users.find(user => user.username === username);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}


module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
