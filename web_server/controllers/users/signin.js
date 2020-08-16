var models = require('../../models/users');

module.exports = {
	post: async function (req, res) {
		try {
			let sess = req.session;

			let params = {
				userId: req.body.userId,
				password: req.body.password,
				socialId: req.body.socialId,
				nickname: req.body.nickname
			};

			let data = await models.signin.post(params);
			// console.log(data[0].id);

			//session
			sess.userId = data[0].id;
			sess.username = data[0].nickname;
			// console.log(sess);
			res.status(200).json({ message: '로그인 성공하였습니다.' });
		} catch (err) {
			console.error(err);
			if (err.message === 'loginErr') res.json({ error: '로그인 실패하였습니다.' });
			else res.status(501).json(err);
		}
	},
};
