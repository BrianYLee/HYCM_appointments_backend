const ApmtService = require('../services/appointmentsService');
const EmplService = require('../services/employeeService');
const VehicleService = require('../services/vehiclesService');

exports.getAppointments = async (req, res) => {
    try {
        const openid = req.query?.openid;
        const dateToFetch = req.query?.date;
        const employee = await EmplService.getEmployeeByOpenId(openid);
        if (!employee || !employee?.active) {
            throw new Error('unauthorized');
        }
        const department = employee.department;
        const appointments = await ApmtService.getAppointmentsByDate(dateToFetch);
        const apmtWithVehiclePromises = appointments.map( async (apmt) => {
            const vehicles = await VehicleService.getVehiclesByApmtId(apmt.id);
            return { ...apmt, vehicles };
        });
        const apmtWithVehicles = await Promise.all(apmtWithVehiclePromises);
        res.json(ApmtService.filterAppointmentsByDept(apmtWithVehicles, department));
    } catch (err) {
        console.error('appointmentsController: getAppointments: caught error', err);
        return res.status(500).json({ error: 'server error' });
    }
};

exports.getAppointment = async (req, res) => {
    try {
        const { openid, apmt } = req.query;
        if (!EmplService.isAdmin(openid)) {
            throw new Error('unauthorized');
        }
        const appointment = await ApmtService.getAppointmentById(apmt);
        const vehicles = await VehicleService.getVehiclesByApmtId(apmt);
        res.json({ ...appointment, vehicles});
    } catch (err) {
        console.error('appointmentsController: getAppointment: caught error', err);
        return res.status(500).json({ error: 'server error' });
    }
};

exports.postAppointment = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.openid || !body.plates) {
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(body.openid);
        if (!employee || !employee?.department == 'admin') {
            throw new Error('unauthorized');
        }
        const apmtRes = await ApmtService.createAppointment(employee.id, body);
        const apmtId = apmtRes.insertId;
        const vehiclesRes = await VehicleService.insertVehicles(apmtId, body.plates);
        res.json(vehiclesRes);
    } catch (err) {
        console.error('appointmentsController: postAppointment: caught error', err);
        return res.status(500).json({ error: 'server error' });
    }
};

exports.editAppointment = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.openid || !body.id) {
            throw new Error('bad request payload');
        }
        if (!await EmplService.isAdmin(body.openid)) {
            throw new Error('unauthorized');
        }
        const result = await ApmtService.updateAppointmentById(body);
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: editAppointment: caught error', err);
        return res.status(500).json({ error: 'server error' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.openid || !body.apmtid ) {
            throw new Error('bad request payload');
        }
        if (!await EmplService.isAdmin(body.openid)) {
            throw new Error('unauthorized');
        }
        const result = await ApmtService.deleteAppointmentById(body.apmtid);
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: deleteAppointment: caught error', err);
        return res.status(500).json({ error: 'server error' }); 
    }
};

exports.postCheckIn = async (req, res) => {
    // TODO: insert check-in record to appropriate table (hotel_ins etc...)
    try {
        const body = req.body;
        if (!body || !body.openid || !body.apmtid || !body.area) {
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(body.openid);
        if (!employee || !employee?.active) {
            throw new Error('unauthorized');
        }
        const result = await ApmtService.checkInById(body.apmtid, body.area);
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: postCheckIn: caught error', err);
        return res.status(500).json({ error: 'server error' }); 
    }
};

exports.postCheckOut = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.openid || !body.apmtid || !body.area) {
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(body.openid);
        if (!employee || !employee?.active) {
            throw new Error('unauthorized');
        }
        const result = await ApmtService.checkOutById(body.apmtid, body.area);
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: postCheckOut: caught error', err);
        return res.status(500).json({ error: 'server error' }); 
    }
};
