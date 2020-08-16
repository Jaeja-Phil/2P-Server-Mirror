const express = require('express');
const router = express.Router();

const { roomController } = require('../controllers');

router.post('/makeroom', roomController.makeroom.post);
router.get('/roomlist', roomController.roomlist.get);
router.post('/joinroom', roomController.joinroom.post);
router.post('/leaveroom', roomController.leaveroom.post);

module.exports = router;
