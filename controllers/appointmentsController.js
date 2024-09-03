const pool = require('../config/db');
//const moment = require('moment-timezone');

const filterAppointmentsByDept = (apmts, dept) => {
    if (!dept) {
        return [];
    }
    switch (dept) {
        case '安保':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: true, canCheckOut: false };
                const { type, hotel, golf, horse, manager_name, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case '市场':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { hotel, golf, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case '酒店':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { golf, horse, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case '球会':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { hotel, horse, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case '马会':
            return apmts.filter(apmt => apmt.horse == true).map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { hotel, golf, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case '其他':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { hotel, golf, horse, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case 'admin':
            return apmts.map((apmt) => {
                return { ...apmt, canCheckIn: true, canCheckOut: true, canEdit: true };
            });
    }
}

// Function to fetch appointment records
exports.getAppointments = (req, res) => {
    try {
        const openid = req.query?.openid;
        const dateToFetch = req.query?.date;
        pool.query(`SELECT * FROM employees WHERE wechat_open_id = ?`,[openid], (err1, result1) => {
            if (err1) {
                return res.status(500).json({ error: 'Database query failed' });
            }
            if (result1.length == 0 || !result1[0].active) {
                return res.status(500).json({ error: 'unauthorized' });
            }
            const employeeDept = result1[0].department;
            pool.query(`SELECT * FROM appointments WHERE DATE(scheduled_date) = '${dateToFetch}'`, (error2, results) => {
                if (error2) {
                    return res.status(500).json({ error: 'Database query failed' });
                }
                // not sure why but inserted records have varying timezones for scheduled_date
                // fix results so that query are in beijing timezone
                results.forEach(appointment => {
                    appointment.scheduled_date = dateToFetch;
                });
                res.json(filterAppointmentsByDept(results, employeeDept));
            });
        });
    } catch (err) {
        console.error('something bad happened', err);
        return res.status(500).json({ error: 'server error' });
    }
};

exports.postAppointment = (req, res) => {
    const body = req.body;
    if (!body || !body.openid || !body.scheduled_date || !body.type || !body.hotel || !body.golf || !body.horse || !body.studio_name || !body.manager_name || !body.plate) {
        return res.status(400).json({ error: 'bad request payload'});
    }
    pool.query(`SELECT * FROM employees WHERE wechat_open_id = ?`,[body.openid], (err1, result1) => {
        if (err1) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (result1.length == 0 || !result1[0]?.department == 'admin') {
            return res.status(500).json({ error: 'unauthorized' });
        }
        const query = `INSERT INTO appointments (scheduled_date, type, hotel, golf, horse, studio_name, manager_name, plate, created_by) SELECT ?, ?, ?, ?, ?, ?, ?, ?, e.id FROM employees e WHERE e.wechat_open_id = ?;`;
        pool.query(query, [body.scheduled_date, body.type, body.hotel, body.golf, body.horse, body.studio_name, body.manager_name, body.plate, body.openid], (error2, result) => {
            if (error2) {
                console.log('db error while posting appointment');
                console.log(body);
                return res.status(500).json({ error: 'db error inserting appointment' });
            }
            res.status(200).json({ message: 'appointment added'});
        });
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
    const employeeIdQuery = 'SELECT * FROM employees WHERE wechat_open_id = ?';
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
            return res.status(500).json({ error: 'no employee found with given openid' });
        }
        if (results1.length > 1) {
            console.log('something is srsly fucked. why are there multiple employees for openid ' + body.openId);
            console.log(results1);
            return res.status(500).json({ error: 'something is srsly fucked. why are there multiple employees for the given openid '});
        }
        if (!results1[0].active) {
            console.log(`${body.openId} is not authorized`);
            console.log(results1);
            return res.status(500).json({ error: 'unauthorized'});
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
    const employeeIdQuery = 'SELECT * FROM employees WHERE wechat_open_id = ?';
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
        if (!results1[0].active) {
            console.log(`${body.openId} is not authorized`);
            console.log(results1);
            return res.status(500).json({ error: 'unauthorized'});
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
