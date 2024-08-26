const pool = require('../config/db');
const moment = require('moment-timezone');

// Function to fetch appointment records
exports.getAppointments = (req, res) => {
    let dateToFetch = req.query?.date || moment().format('YYYY-MM-DD');
    console.log('dateToFetch: ' + dateToFetch);
    pool.query(`SELECT * FROM appointments WHERE DATE(scheduled_date) = '${dateToFetch}'`, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        // not sure why but inserted records have varying timezones for scheduled_date
        // fix results so that query are in beijing timezone
        results.forEach(appointment => {
            const dateUTC = moment().utc(appointment.scheduled_date);
            const formattedDate = dateUTC.tz('Asia/Shanghai').format('YYYY-MM-DD');
            appointment.scheduled_date = formattedDate;
        });
        console.log(results);
        res.json(results);
    });
};