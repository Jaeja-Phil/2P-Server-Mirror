module.exports = {
	post: (req, res) => {
		const sess = req.session;
		// console.log(sess);
		if (sess.userId) {
			req.session.destroy(err => {
				if (err) {
					console.log(err);
					res.status(501).json(err);
				} else {
					// res.redirect('/'); 
					res.status(200).json({ 'message': '성공적으로 로그아웃되었습니다' });
				}
			});
		} else {
			// res.redirect('/');
			res.status(401).json({ 'error': '이미 로그아웃되었습니다' });
		}
	}
};
