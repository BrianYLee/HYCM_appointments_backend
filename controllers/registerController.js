const { isAdmin } = require('../services/employeeService');
const RegService = require('../services/registerService');

exports.getRegister = async (req, res) => {
    try {
        const openid = req.query?.openid;
        if (!openid)
            throw new Error('bad query parameters');
        const applications = await RegService.getApplicationsByOpenId(openid);
        res.json(applications);
    } catch (err) {
        console.error('registerController: getRegister: caught error', err);
        return res.status(500).json({error: 'server error'});
    }
};

exports.postRegister = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.openid)
            throw new Error('bad request payload');
        const result = await RegService.createApplication(body);
        res.json(result);
    } catch (err) {
        console.error('registerController: getRegister: caught error', err);
        return res.status(500).json({error: 'server error'});
    }
};

exports.getApplications = async (req, res) => {
    try {
        const openid = req.query?.openid;
        if (!openid) 
            throw new Error('bad query parameters');
        if (!await isAdmin(openid))
            throw new Error('unauthorized');
        const applications = await RegService.getAllApplications();
        res.json(applications);
    } catch (err) {
        console.error('registerController: getApplications: caught error', err);
        return res.status(500).json({error: 'server error'});
    }
};

exports.approve = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.employee_openid || !body.application_id) {
            throw new Error('bad request payload');
        }
        if (!await isAdmin(body.employee_openid))
            throw new Error('unauthorized');
        const result = await RegService.evaluateApplication(body.application_id, true);
        res.json(result);
    } catch (err) {
        console.error('registerController: approve: caught error', err);
        return res.status(500).json({error: 'server error'});
    }
};

exports.reject = async (req, res) => {
    try {
        const body = req.body;
        if (!body || !body.employee_openid || !body.application_id) {
            throw new Error('bad request payload');
        }
        if (!await isAdmin(body.employee_openid))
            throw new Error('unauthorized');
        const result = await RegService.evaluateApplication(body.application_id, false);
        res.json(result);
    } catch (err) {
        console.error('registerController: approve: caught error', err);
        return res.status(500).json({error: 'server error'});
    }
};
