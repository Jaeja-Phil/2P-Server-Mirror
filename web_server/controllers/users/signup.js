var models = require('../../models/users');

module.exports = {
	post: async function (req, res) {
		try {
			let params = {
				userId: req.body.userId,
				password: req.body.password,
				nickname: req.body.nickname
			};
			await models.signup.post(params);
			res.status(200).json({ 'message': '회원가입 성공했습니다.' });
		} catch (err) {
			console.error(err);
			if(err.message === 'userId') res.json({ 'error': '이미 존재하는 아이디입니다.'  });
			else if(err.message === 'nickname') res.json({ 'error': '이미 존재하는 닉네임입니다.'  });
			else res.status(501).json(err);
		}
	}
};
