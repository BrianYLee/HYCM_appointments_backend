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
        if (!body || !body.openid || !body.vehicles) {
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(body.openid);
        if (!employee || !employee?.department == 'admin') {
            throw new Error('unauthorized');
        }
        const apmtRes = await ApmtService.createAppointment(employee.id, body);
        const apmtId = apmtRes.insertId;
        const vehiclesRes = await VehicleService.insertVehicles(apmtId, body.vehicles);
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
        const apmtRes = await ApmtService.updateAppointmentById(body);
        console.log(apmtRes);
        const vehiclePromises = body.vehicles.map((vehicle) => {
            if (vehicle.isDeleted === true) return VehicleService.deleteVehicleById(vehicle);
            else if (vehicle.isNew === true) return VehicleService.insertVehicle(body.id, vehicle.plate);
            else if (vehicle.isEdited === true) return VehicleService.updateVehicle(vehicle);
        });
        const vehiclesRes = await Promise.all(vehiclePromises);
        res.json({ ...apmtRes, ...vehiclesRes});
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
        const { openid, id, area } = body; 
        if (!openid || !id || !area){
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(openid);
        if (!employee || !employee?.active) {
            throw new Error('unauthorized');
        }
        let result;
        switch (area) {
            case 'security':
                result = await VehicleService.checkInById(id);
                break;
            case 'jockey':
            case 'golf':
            case 'hotel':
                result = await ApmtService.checkInById(id, area);
                break;
            default:
                throw new Error('unknown area for check in');
        }
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: postCheckIn: caught error', err);
        return res.status(500).json({ error: 'server error' }); 
    }
};

exports.postCheckOut = async (req, res) => {
    try {
        const body = req.body;
        const { openid, id, area } = body; 
        if (!openid || !id || !area){
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(openid);
        if (!employee || !employee?.active) {
            throw new Error('unauthorized');
        }
        let result;
        switch (area) {
            case 'security':
                result = await VehicleService.checkOutById(id);
                break;
            case 'jockey':
            case 'golf':
            case 'hotel':
                result = await ApmtService.checkOutById(id, area);
                break;
            default:
                throw new Error('unknown area for check out');
        }
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: postCheckOut: caught error', err);
        return res.status(500).json({ error: 'server error' }); 
    }
};

exports.postVehicleCheckIn = async (req, res) => {
    // TODO: insert check-in record to appropriate table (hotel_ins etc...)
    try {
        const body = req.body;
        if (!body || !body.openid || !body.v_id) {
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(body.openid);
        if (!employee || !employee?.active) {
            throw new Error('unauthorized');
        }
        const result = await VehicleService.checkInById(body.v_id);
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: postVehicleCheckIn: caught error', err);
        return res.status(500).json({ error: 'server error' }); 
    }
};

exports.postVehicleCheckOut = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.openid || !body.v_id) {
            throw new Error('bad request payload');
        }
        const employee = await EmplService.getEmployeeByOpenId(body.openid);
        if (!employee || !employee?.active) {
            throw new Error('unauthorized');
        }
        const result = await VehicleService.checkOutById(body.v_id);
        res.json(result);
    } catch (err) {
        console.error('appointmentsController: postVehicleCheckOut: caught error', err);
        return res.status(500).json({ error: 'server error' }); 
    }
};