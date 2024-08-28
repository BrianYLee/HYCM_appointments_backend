const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');

// Define the route to fetch appointment records
router.get('/', appointmentsController.getAppointments);

// checkin
router.post('/checkin', appointmentsController.postCheckIn);

// checkout
router.post('/checkout', appointmentsController.postCheckOut);

module.exports = router;
