const express = require('express');
const router = express.Router();

const { userController } = require('../controllers');

// * POST /users/signin
router.post('/signin', userController.signin.post);

// * POST /users/signout
router.post('/signout', userController.signout.post);

// * POST /users/signup
router.post('/signup', userController.signup.post);

// * GET /users/mypage
router.get('/mypage', userController.mypage.get);

// * PUT /users/mypage
router.put('/mypage', userController.mypage.put);

// * POST /users/mypage from game_server
router.post('/mypage', userController.mypage.post)

module.exports = router;
