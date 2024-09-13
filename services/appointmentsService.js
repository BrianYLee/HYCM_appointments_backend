const pool = require('../config/db');

const filterAppointmentsByDept = (apmts, dept) => {
    if (!dept) {
        return [];
    }
    switch (dept) {
        case '安保':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: true, canCheckOut: false };
                const { type, hotel, golf, horse, areas, scheduled_time_string, manager_name, bridal_name, created_date, created_by, ...rest } = apmt;
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
                const { golf, horse, created_date, areas, created_by, ...rest } = apmt;
                return rest;
            });
        case '球会':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { hotel, horse, created_date, areas, scheduled_time_string, created_by, ...rest } = apmt;
                return rest;
            });
        case '马会':
            return apmts.filter(apmt => apmt.horse == true).map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { hotel, golf, areas, scheduled_time_string, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case '其他':
            return apmts.map((apmt) => {
                apmt = { ...apmt, canCheckIn: false, canCheckOut: false };
                const { hotel, golf, horse, areas, scheduled_time_string, bridal_name, created_date, created_by, ...rest } = apmt;
                return rest;
            });
        case 'admin':
            return apmts.map((apmt) => {
                return { ...apmt, canCheckIn: true, canCheckOut: true, canEdit: true };
            });
    }
};

const parseAreaName = (area) => {
    switch (area) {
        case 'hotel': return 'hotel_checked_in';
        case 'golf': return 'golf_checked_in';
        case 'jockey': return 'jockey_checked_in';
    };
    return null;
}

const getAppointmentsByDate = (dateToFetch) => {
    return new Promise((res, rej) => {
        const query =
            `SELECT *, DATE_FORMAT(scheduled_date, '%Y-%m-%d') AS scheduled_date, DATE_FORMAT(created_date, '%Y-%m-%d') AS created_date
            FROM appointments
            WHERE DATE(scheduled_date) = ? AND deleted = FALSE`;
        pool.query(query, [dateToFetch], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const getAppointmentById = (id) => {
    return new Promise((res, rej) => {
        const query = 
            `SELECT *, DATE_FORMAT(scheduled_date, '%Y-%m-%d') AS scheduled_date
            FROM appointments
            WHERE id = ?`;
        pool.query(query, [id], (error, results) => {
            if (error) return rej(error);
            if (results.length === 0) res(null);
            res(results[0]);
        });
    });
};

const createAppointment = (employeeId, data) => {
    return new Promise((res, rej) => {
        const query =
            `INSERT INTO appointments (type, scheduled_date, scheduled_time_string, areas, has_jockey, studio_name, manager_name, bridal_name, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        pool.query(query, [data.type, data.scheduled_date, data.scheduled_time_string, data.areas, data.has_jockey, data.studio_name, data.manager_name, data.bridal_name, employeeId], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const updateAppointmentById = (data) => {
    return new Promise((res, rej) => {
        const query =
            `UPDATE appointments
            SET type = ?, scheduled_date = ?, scheduled_time_string = ?, areas = ?, has_jockey = ?, studio_name = ?, manager_name = ?, bridal_name = ?, hotel_checked_in = ?, golf_checked_in = ?, jockey_checked_in = ?
            WHERE id = ?`;
        pool.query(query, [data.type, data.scheduled_date, data.scheduled_time_string, data.areas, data.has_jockey, data.studio_name, data.manager_name, data.bridal_name, data.hotel_checked_in, data.golf_checked_in, data.jockey_checked_in, data.id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const deleteAppointmentById = (id) => {
    return new Promise((res, rej) => {
        const query = `UPDATE appointments SET deleted = TRUE WHERE id = ?`;
        pool.query(query, [id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const checkInById = (id, area) => {
    return new Promise((res, rej) => {
        const areaColName = parseAreaName(area);
        if (!areaColName) return rej('bad area name ' + area);
        const query =
            `UPDATE appointments
            SET ${areaColName} = TRUE
            WHERE id = ?`;
        pool.query(query, [id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

const checkOutById = (id, area) => {
    const areaColName = parseAreaName(area);
    if (!areaColName) return rej('bad area name ' + area);
    return new Promise((res, rej) => {
        const query =
            `UPDATE appointments
            SET ${areaColName} = FALSE
            WHERE id = ?`;
        pool.query(query, [id], (error, results) => {
            if (error) return rej(error);
            res(results);
        });
    });
};

module.exports = {
    filterAppointmentsByDept,
    getAppointmentsByDate,
    getAppointmentById,
    createAppointment,
    updateAppointmentById,
    deleteAppointmentById,
    checkInById,
    checkOutById
};
