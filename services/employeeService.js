const pool = require('../config/db');

// getters
const getEmployeeById = (id) => {
    return new Promise(( res, rej ) => {
        const query = 'SELECT * FROM employees WHERE id = ?';
        pool.query(query, [id], (error, results) => {
            if (error) return rej(error);
            if (results.length === 0) return res(null);
            res(results[0]);
        })
    })
};

const getEmployeeByOpenId = (wechat_open_id) => {
    return new Promise((res, rej) => {
        const query = 'SELECT * FROM employees WHERE wechat_open_id = ?';
        pool.query(query, [wechat_open_id], (error, results) => {
            if (error) return rej(error);
            if (results.length === 0) return res(null);
            res(results[0]);
        });
    });
};

const isEmployee = (wechat_open_id) => {
    return new Promise((res, rej) => {
        const query = 'SELECT * FROM employees WHERE wechat_open_id = ? AND active = TRUE';
        pool.query(query, [wechat_open_id], (error, results) => {
            if (error) return rej(error);
            if (results.length === 0) return res(false);
            res(true);
        });
    });
};

const isAdmin = (wechat_open_id) => {
    return new Promise((res, rej) => {
        const query = 'SELECT * FROM employees WHERE wechat_open_id = ? AND department = "admin"';
        pool.query(query, [wechat_open_id], (error, results) => {
            if (error) return rej(error);
            if (results.length === 0) return res(false);
            res(true);
        });
    });
};

module.exports = {
    getEmployeeById,
    getEmployeeByOpenId,
    isEmployee,
    isAdmin
};
