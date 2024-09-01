const express = require('express');
const router = express.Router();
const wechat_sessionController = require('../controllers/wechat_sessionsController');

router.post('/wechat_login', wechat_sessionController.postWechatLogin);
router.post('/wechat_renew', wechat_sessionController.postWechatRenew);

module.exports = router;
