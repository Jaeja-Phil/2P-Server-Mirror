/* eslint-disable indent */
let mypage = require('../../models/mypage');

module.exports = {
  get: async function (req, res) {
    let { userId } = await req.session;
    if (!userId) {
      res.status(401).json({ error: '다시 로그인해주세요' });
    } else {
      try {
        let data = await mypage.get(userId);
        console.log(data);
        res.status(200).json(data[0]);
      } catch (error) {
        console.error(error);
        res.status(401).json({ error: '다시 로그인해주세요' });
      }
    }
  },
  put: async function (req, res) {
    let { userId } = await req.session;
    if (!userId) {
      res.status(401).json({ error: '다시 로그인해주세요' });
    } else {
      try {
        let { avatarId } = await req.body;

        let param = {
          userId,
          avatarId,
        };
        // console.log(param);

        await mypage.put(param);
        res.status(200).json({ message: '성공적으로 변경되었습니다' });
      } catch (error) {
        console.error(error);
        res.status(401).json({ error: '다시 로그인해주세요' });
      }
    }
  },
  post: async function (req, res) {
    let { body } = await req;
    console.log(body);
    try {
      await mypage.post(body);
      res.status(200).send('game result has been sent');
    } catch (error) {
      res.status(404).send(error);
    }
  },
};
