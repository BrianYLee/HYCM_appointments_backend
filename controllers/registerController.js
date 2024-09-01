const pool = require('../config/db');

// Function to fetch appointment records
exports.getRegister = (req, res) => {
    console.log('got getRegister req');
    const openid = req.query?.openid;
    if (!openid) {
        return res.status(500).json({ error: 'no id in query params' });
    }
    pool.query(`SELECT id, is_approved FROM applications WHERE openid = '${openid}'`, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
};

exports.postRegister = (req, res) => {
    console.log('got postRegister req');
    const body = req.body;
    if (!body || !body.openid) {
        return res.status(400).json({ error: 'bad request payload'});
    }
    const { openid, lName, fName, phone, dept } = body;
    // queries
    const application_query = 'INSERT INTO applications (openid, last_name, first_name, phone, department, is_approved) VALUES (?, ?, ?, ?, ?, NULL);';
    
    // results
    pool.query(application_query, [openid, lName, fName, phone, dept], (err, result) => {
        if (err) {
            console.log('db error while inserting application: ');
            console.log(body)
            return res.status(500).json({ error: 'db error inserting application' });
        }
        res.status(200).json({ success: true, message: 'application created'});
    });
};

exports.getApplications = async (req, res) => {
    console.log('got getApplications req');
    const openid = req.query?.openid;
    if (!openid) {
        return res.status(500).json({ error: 'no id in query params' });
    }
    pool.query(`SELECT * FROM employees WHERE wechat_open_id = '${openid}' AND department = 'admin'`, (err1, res1) => {
        if (err1) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (res1.length == 1) {
            pool.query(`SELECT * FROM applications`, (error, results) => {
                if (error) {
                    return res.status(500).json({ error: 'Database query failed' });
                }
                return res.json(results);
            });
        }
    });
};

exports.approve = async (req, res) => {
    console.log('got approve POST req');
    const body = req.body;
    if (!body || !body.employee_openid || !body.application_id || !body.application_openid) {
        return res.status(400).json({ error: 'bad request payload'});
    }
    const { employee_openid, application_id, application_openid } = body;
    pool.query(`SELECT * FROM employees WHERE wechat_open_id = '${employee_openid}' AND department = 'admin'`, (err1, res1) => {
        if (err1) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (res1.length == 1) {
            pool.query(`UPDATE applications SET is_approved = TRUE WHERE id='${application_id}' AND openid='${application_openid}'`, (error, results) => {
                if (error) {
                    return res.status(500).json({ error: 'application update failed' });
                }
                return res.json(results);
            });
        }
    });
};

exports.reject = async (req, res) => {
    console.log('got reject POST req');
    const body = req.body;
    if (!body || !body.employee_openid || !body.application_id || !body.application_openid) {
        return res.status(400).json({ error: 'bad request payload'});
    }
    const { employee_openid, application_id, application_openid } = body;
    pool.query(`SELECT * FROM employees WHERE wechat_open_id = '${employee_openid}' AND department = 'admin'`, (err1, res1) => {
        if (err1) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (res1.length == 1) {
            pool.query(`UPDATE applications SET is_approved = FALSE WHERE id='${application_id}' AND openid='${application_openid}'`, (error, results) => {
                if (error) {
                    return res.status(500).json({ error: 'application update failed' });
                }
                return res.json(results);
            });
        }
    });
};
