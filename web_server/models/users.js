const db = require('../db/config');
const crypto = require('crypto');

module.exports = {
	signup : {
		post: async function(data) {
			let {userId, password, nickname} = await data;
			//password 암호화
			let key = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toString('hex');
			password = key;
	
			return new Promise((resolve, reject) => {
				let sql = `
				select not exists(
					select userId
					from users
					where userId = ?
				) as result`;
				db.query(sql, userId, (error, result) => {
					if(result[0].result !== 1) {
						return reject(new Error('userId'));
					} else {
						let sql = `
						select not exists(
							select nickname
							from users
							where nickname = ?
						) as result`;
						db.query(sql, nickname, (error, result) => {
							if(result[0].result !== 1) {
								return reject(new Error('nickname'));
							} else {
								let sql = `
								insert into users (userId, nickname, password)
								values (?, ?, ?)`;
								db.query(sql, [userId, nickname, password], (error, result) => {
									error? reject(error) : resolve(result);
								});
							}
						});
					}	
				});
			});
		}
	},
	signin: {
		post: async function(data) {
			let {userId, password, socialId, nickname} = await data;
			// let shasum = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toSting('hex');
			// password = shasum;
			if(!data.socialId) {	//소셜 로그인 아닌 경우
				let key = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toString('hex');
				password = key;
				return new Promise((resolve, reject) => {
					let sql = `
							select
								id,
								nickname,
								avatarId
							from users
							where userId = ? and password = ?`;
					db.query(sql, [userId, password], (error, result) => {
						if(!result.length) reject(new Error('loginErr'));
						// console.log(result);
						error ? reject(error) : resolve(result);
					});
				});
			} else {
				return new Promise((resolve, reject) => {
					let sql = `
							insert into users (userId, nickname, socialId)
							select ?, ?, ?
							from dual
							where not exists(
								select userId, socialId 
								from users where socialId = ? and userId = ?)`;
					db.query(sql, [userId, nickname, socialId, socialId, userId], (error) => {
						if(error) {return reject(error);}
						let sql = `
							select id, userId, nickname
							from users
							where userId = ? and socialId = ?`;
						db.query(sql, [userId, socialId], (error, result) => {
							error ? reject(error) : resolve(result);
						}); 
					});
				});
			}
		}
	}
};

