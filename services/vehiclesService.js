const pool = require('../config/db');

const getVehiclesByApmtId = (a_id) => {
    return new Promise((res, rej) => {
        const query = `SELECT * FROM vehicles WHERE appointment_id = ?`;
        pool.query(query, [a_id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const insertVehicles = (a_id, plates) => {
    return new Promise((res, rej) => {
        let query = `INSERT INTO vehicles (appointment_id, plate) VALUES `;
        const values = plates.map(plate => {
            return `(${pool.escape(a_id)}, ${pool.escape(plate)})`;
        }).join(', ');
        query += values;
        pool.query(query, (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const checkInById = (id) => {
    return new Promise((res, rej) => {
        const query =
            `UPDATE vehicles
            SET checked_in = TRUE
            WHERE id = ?`;
        pool.query(query, [id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const checkOutById = (id) => {
    return new Promise((res, rej) => {
        const query =
            `UPDATE vehicles
            SET checked_in = FALSE
            WHERE id = ?`;
        pool.query(query, [id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

module.exports = {
    getVehiclesByApmtId,
    insertVehicles,
    checkInById,
    checkOutById
};
