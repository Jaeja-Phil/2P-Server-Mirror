const db = require('../db/config');

module.exports = {
  get: async function (data) {
    return new Promise((resolve, reject) => {
      let sql = `
				select
					gl.gameName,
					p.gamesPlayed,
					p.gamesWon,
					p.gamesTied,
					p.gamesPlayed - p.gamesWon - p.gamesTied as gamesLost
				from users_game ug
				join gameList gl on gl.code = ug.gameCode
				join playerScore p on p.scoreId = ug.id
				where ug.userId = ?
				order by gl.gameName
				`;

      db.query(sql, data, (error1, result1) => {
        if (error1) {
          reject(error1);
        } else {
          let sql = `
							select nickname, avatarId
							from users
							where id = ?`;
          db.query(sql, data, (error2, result2) => {
            if (error2) {
              reject(error2);
            } else {
              if (result1.length === 0) {
                resolve(result2);
              } else {
                for (let row of result1) {
                  result2[0][row.gameName] = {
                    play: row.gamesPlayed,
                    win: row.gamesWon,
                    tie: row.gamesTied,
                    lose: row.gamesLost,
                  };
                }
                resolve(result2);
              }
            }
          });
        }
      });
    });
  },
  put: async function (data) {
    let { userId, avatarId } = await data;

    return new Promise((resolve, reject) => {
      let sql = `
					update users
					set avatarId = ?
					where id = ?
					`;
      db.query(sql, [avatarId, userId], (error, result) => {
        error ? reject(error) : resolve(result);
      });
    });
  },
  post: async function (data) {
    let { score } = await data;
    let { gameCode } = await data;
    let [player1, player2] = Object.keys(score);
    const connection = await db.promise().getConnection();

    try {
      await connection.beginTransaction();
      await makeHistory(gameCode, player1);
      await makeHistory(gameCode, player2);

     let winner
			let loser
			let draw = []
	
			if(score[player1] > score[player2]) {
				winner = player1
				loser = player2
				await updateScore(gameCode, winner, loser)
			} else if (score[player1] < score[player2]) {
				winner = player2
				loser = player1
				await updateScore(gameCode, winner, loser)
			} else {
				draw.push(player1)
				draw.push(player2)
				await updateDraw(gameCode, draw)
			}
			await connection.commit()
		} catch (error) {
			await connection.rollback()
			return error
		} finally {
			connection.release()
		}
  },
};

//ID from users table (checked)
async function getUserId(nickname) {
  let sql = 'select id from users where nickname = ?';
  let result = (await db.promise().query(sql, nickname))[0][0];
  return result.id;
}

async function getScoreId(gameCode, userId) {
  let sql = 'select id from users_game where userId = ? and gameCode = ?';
  let result = (await db.promise().query(sql, [userId, gameCode]))[0][0];
  return result.id;
}

//get player's game history
async function getHistory(gameCode, nickname) {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    let userId = await getUserId(nickname);
    let scoreId = await getScoreId(gameCode, userId);
    let sqlHistory = `
			select *
			from playerScore
			where scoreId = ?`;

    await connection.commit();
    return (await connection.query(sqlHistory, [scoreId]))[0][0];
    /*
		{
			scoreId : 1,
			gamesPlayed : 3,
			gamesWon : 2,
			gamesTied: 0
		}
		 */
  } catch (error) {
    await connection.rollback();
    console.log(error);
    throw 'getHistory error';
  } finally {
    connection.release();
  }
}

//when a player played a game for the first time this function insert a row at users_game table and playerScore table
async function makeHistory(gameCode, nickname) {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    let userId = await getUserId(nickname);

    let sql = `
		insert into users_game (userId, gameCode)
		select ?, ?
		from dual
		where not exists(
			select * from users_game
			where userId = ?
			and gameCode = ?
		)`;

    let row = (await connection.query(sql, [userId, gameCode, userId, gameCode]))[0];
    if (row.affectedRows === 1) {
      let scoreId = row.insertId;
      let sql = `
			insert into playerScore (scoreId, gamesPlayed, gamesWon, gamesTied)
			values(?, ?, ?, ?)`;
      await connection.query(sql, [scoreId, 0, 0, 0]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error);
    throw 'makeHistory error';
  } finally {
    connection.release();
  }
}

//when a game finished update score for playerScore table
async function updateScore(gameCode, winner, loser) {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    let {
      scoreId: winnerScoreId,
      gamesPlayed: winnerGamesPlayed,
      gamesWon: winnerGamesWon,
      gamesTied: winnerGamesTied,
    } = await getHistory(gameCode, winner);

    let {
      scoreId: loserScoreId,
      gamesPlayed: loserGamesPlayed,
      gamesWon: loserGamesWon,
      gamesTied: loserGamesTied,
    } = await getHistory(gameCode, loser);

    let sql = `
		update playerScore
		set gamesPlayed = ?,
				gamesWon = ?,
				gamesTied = ?
		where scoreId = ?
		`;
    /* console.log(`
		b winner scoreid: ${winnerScoreId}
		b winner played: ${winnerGamesPlayed}
		b winner won: ${winnerGamesWon}
		b winner tied: ${winnerGamesTied}`) */

    await connection.query(sql, [
      winnerGamesPlayed + 1,
      winnerGamesWon + 1,
      winnerGamesTied,
      winnerScoreId,
    ]);
    await connection.query(sql, [
      loserGamesPlayed + 1,
      loserGamesWon,
      loserGamesTied,
      loserScoreId,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error);
    throw 'updateScore error';
  } finally {
    connection.release();
  }
}

async function updateDraw(gameCode, players) {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    let {
      scoreId: player1ScoreId,
      gamesPlayed: player1GamesPlayed,
      gamesTied: player1GamesTied,
    } = await getHistory(gameCode, players[0]);
    let {
      scoreId: player2ScoreId,
      gamesPlayed: player2GamesPlayed,
      gamesTied: player2GamesTied,
    } = await getHistory(gameCode, players[1]);

    let sql = `
		update playerScore
		set gamesPlayed = ?,
				gamesTied = ?
		where scoreId = ?
		`;

    await connection.query(sql, [player1GamesPlayed + 1, player1GamesTied + 1, player1ScoreId]);
    await connection.query(sql, [player2GamesPlayed + 1, player2GamesTied + 1, player2ScoreId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error);
    throw 'updateDraw error';
  } finally {
    connection.release();
  }
}
