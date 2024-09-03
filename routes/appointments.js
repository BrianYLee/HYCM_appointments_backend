const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');

// Define the route to fetch appointment records
router.get('/', appointmentsController.getAppointments);

// new appoint record
router.post('/', appointmentsController.postAppointment);

// checkin
router.post('/checkin', appointmentsController.postCheckIn);

// checkout
router.post('/checkout', appointmentsController.postCheckOut);

// edit (admin only)
//router.get('/edit', appointmentsController.getAppointment);
//router.post('/edit', appointmentsController.editAppointment);

module.exports = router;
