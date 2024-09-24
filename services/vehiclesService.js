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

const insertVehicle = (a_id, plate) => {
    return new Promise((res, rej) => {
        const query = `INSERT INTO vehicles (appointment_id, plate) VALUES (?, ?)`;
        pool.query(query, [a_id, plate], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const insertVehicles = (a_id, vehicles) => {
    return new Promise((res, rej) => {
        let query = `INSERT INTO vehicles (appointment_id, plate) VALUES `;
        const values = vehicles.map(v => {
            return `(${pool.escape(a_id)}, ${pool.escape(v.plate)})`;
        }).join(', ');
        query += values;
        pool.query(query, (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const updateVehicle = (vehicle) => {
    return new Promise((res, rej) => {
        const query = `UPDATE vehicles SET plate = ?, checked_in = ? WHERE id = ?`;
        pool.query(query, [vehicle.plate, vehicle.checked_in, vehicle.id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
}

const deleteVehicleById = (vehicle) => {
    return new Promise((res, rej) => {
        const query = `DELETE FROM vehicles WHERE id = ?`;
        pool.query(query, [vehicle.id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
}

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
    insertVehicle,
    insertVehicles,
    updateVehicle,
    deleteVehicleById,
    checkInById,
    checkOutById
};
