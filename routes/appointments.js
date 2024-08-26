const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');

// Define the route to fetch appointment records
router.get('/', appointmentsController.getAppointments);

module.exports = router;
