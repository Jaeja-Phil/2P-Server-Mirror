let log = {};

function randomNum() {
  let numArr = [0,1,2,3,4,5,6,7,8,9];
  let data = [];
  for(let i = 0; i < 4; i++){
    data[i] = numArr.splice(Math.floor(Math.random() * numArr.length), 1)[0];
  }
  
  return data;
}

function getResult(ans, sub){
  let strike = 0;
  let ball = 0;

  for(let i = 0; i < 4; i++){
    let idx = ans.indexOf(sub[i]);
    if(idx === i) strike++;
    else if(idx !== -1) ball++;
  }
  if(strike || ball) return `${strike}S${ball}B`
  else return 'OUT'
}

function gameStart(room, users){
  if(!log[room]){
    log[room] = {};
    log[room][users[0]] = [];
    log[room][users[1]] = [];
  }

  return log[room];
}

function makelog(room, user, data){
  if(log[room][user].length < 6){
    log[room][user].push(data);
  }

  return log[room];
}

function endGame(room){
  delete log[room];
}

function isGame(room){
  // console.log(log[room]);
  return Boolean(log[room]);
}

function getlog(room){
  return log[room];
}

module.exports = {
  randomNum,
  getResult,
  gameStart,
  makelog,
  endGame,
  isGame,
  getlog
}
