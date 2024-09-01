const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

router.get('/', registerController.getRegister);
router.post('/', registerController.postRegister);
router.get('/applications', registerController.getApplications);
router.post('/approve', registerController.approve);
router.post('/reject', registerController.reject);

module.exports = router;
