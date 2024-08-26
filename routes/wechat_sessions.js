const express = require('express');
const router = express.Router();
const wechat_sessionController = require('../controllers/wechat_sessionsController');

router.post('/', wechat_sessionController.postWechatLogin);

module.exports = router;
