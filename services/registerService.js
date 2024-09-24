const pool = require('../config/db');

const getAllApplications = () => {
    return new Promise((res, rej) => {
        const query = 'SELECT * FROM applications';
        pool.query(query, [], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
}

const getApplicationsByOpenId = (openid) => {
    return new Promise((res, rej) => {
        const query = 'SELECT id, is_approved FROM applications WHERE openid = ?';
        pool.query(query, [openid], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const createApplication = (data) => {
    return new Promise((res, rej) => {
        const { openid, lName, fName, phone, dept } = data;
        const query = 'INSERT INTO applications (openid, last_name, first_name, phone, department, is_approved) VALUES (?, ?, ?, ?, ?, NULL);';
        pool.query(query, [openid, lName, fName, phone, dept], (error, result) => {
            if (error) return rej(error);
            res(result);
        });
    });
};

const evaluateApplication = (id, evaluation) => {
    return new Promise((res, rej) => {
        const query = 'UPDATE applications SET is_approved = ? WHERE id= ?';
        pool.query(query, [evaluation, id], (error, result) => {
            if (error) return rej(error);
            res(result);
        })
    });
}

module.exports = {
    getAllApplications,
    getApplicationsByOpenId,
    createApplication,
    evaluateApplication
};
