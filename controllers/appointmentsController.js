const pool = require('../config/db');
const moment = require('moment-timezone');

// Function to fetch appointment records
exports.getAppointments = (req, res) => {
    const dateToFetch = req.query?.date || moment().format('YYYY-MM-DD');
    console.log('dateToFetch: ' + dateToFetch);
    pool.query(`SELECT * FROM appointments WHERE DATE(scheduled_date) = '${dateToFetch}'`, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        // not sure why but inserted records have varying timezones for scheduled_date
        // fix results so that query are in beijing timezone
        results.forEach(appointment => {
            //const dateUTC = moment().utc(appointment.scheduled_date);
            //console.log('dateUTC: ' +dateUTC);
            //const formattedDate = dateUTC.tz('Asia/Shanghai').format('YYYY-MM-DD');
            appointment.scheduled_date = dateToFetch;
        });
        console.log(results);
        res.json(results);
    });
};

exports.postCheckIn = (req, res) => {
    const body = req.body;
    console.log('got checkin post request');
    console.log(body);
    if (!body || !body.openId || !body.apmtId) {
        return res.status(400).json({ error: 'bad request payload'});
    }
    
    // queries
    const employeeIdQuery = 'SELECT id FROM employees WHERE wechat_open_id = ?';
    const apmtQuery = 'UPDATE appointments SET checked_in = ? WHERE id = ?';
    const checkInQuery = 'INSERT INTO check_ins (appointment_id, employee_id) VALUES (?, ?)';
    
    // results
    pool.query(employeeIdQuery, [body.openId], (err1, results1) => {
        if (err1) {
            console.log('db error while fetching employee ID ' + body.openId);
            return res.status(500).json({ error: 'db error while fetching employee ID' });
        }
        if (results1.length == 0) {
            console.log('no employee found with openid ' + body.openId);
            return res.status(500).json({ error: 'no employee foun with given openid' });
        }
        if (results1.length > 1) {
            console.log('something is srsly fucked. why are there multiple employees for openid ' + body.openId);
            console.log(results1);
            return res.status(500).json({ error: 'something is srsly fucked. why are there multiple employees for the given openid '});

        }
        const employeeId = results1[0].id;
        pool.query(apmtQuery, [true, body.apmtId], (err2, results2) => {
            if (err2) {
                console.log('db error while updating appointment id ' + body.apmtId);
                return res.status(500).json({ error: `db error while updating appointment id ${body.apmtId}` });
            }
            pool.query(checkInQuery, [body.apmtId, employeeId], (err3, results3) => {
                if (err3) {
                    console.log(`db error while creating checkin for apmtId ${body.apmtId}`);
                    return res.status(500).json({ error: `db error while creating checkin for apmtId ${body.apmtId}` });
                }
                res.status(200).json({ message: 'appointment checked in'});
            });
        });
    });
};

exports.postCheckOut = (req, res) => {
    const body = req.body;
    console.log('got check-out post request');
    console.log(body);
    if (!body || !body.openId || !body.apmtId) {
        return res.status(400).json({ error: 'bad request payload'});
    }
    
    // queries
    const employeeIdQuery = 'SELECT id FROM employees WHERE wechat_open_id = ?';
    const apmtQuery = 'UPDATE appointments SET checked_in = ? WHERE id = ?';
    const checkOutQuery = 'INSERT INTO check_outs (appointment_id, employee_id) VALUES (?, ?)';
    
    // results
    pool.query(employeeIdQuery, [body.openId], (err1, results1) => {
        if (err1) {
            console.log('db error while fetching employee ID ' + body.openId);
            return res.status(500).json({ error: 'db error while fetching employee ID' });
        }
        if (results1.length == 0) {
            console.log('no employee found with openid ' + body.openId);
            return res.status(500).json({ error: 'no employee foun with given openid' });
        }
        if (results1.length > 1) {
            console.log('something is srsly fucked. why are there multiple employees for openid ' + body.openId);
            console.log(results1);
            return res.status(500).json({ error: 'something is srsly fucked. why are there multiple employees for the given openid '});

        }
        const employeeId = results1[0].id;
        pool.query(apmtQuery, [false, body.apmtId], (err2, results2) => {
            if (err2) {
                console.log('db error while updating appointment id ' + body.apmtId);
                return res.status(500).json({ error: `db error while updating appointment id ${body.apmtId}` });
            }
            pool.query(checkOutQuery, [body.apmtId, employeeId], (err3, results3) => {
                if (err3) {
                    console.log(`db error while creating check-out for apmtId ${body.apmtId}`);
                    return res.status(500).json({ error: `db error while creating check-out for apmtId ${body.apmtId}` });
                }
                res.status(200).json({ message: 'appointment checked out'});
            });
        });
    });
};
