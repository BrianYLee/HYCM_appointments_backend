const LoginService = require('../services/loginService');
const { getEmployeeByOpenId } = require('../services/employeeService');
const axios = require('axios');

exports.postWechatLogin = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) 
            throw new Error('bad query parameters');
        // get session_key and openid via WeChat API
        const response = await axios.get(process.env.WECHAT_API_SESSION, {
            params: {
                appid: process.env.WECHAT_APP_ID,
                secret: process.env.WECHAT_APP_SECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });
        const { openid, session_key, errcode, errmsg } = response.data;
        if (errcode) {
            throw new Error(errmsg);
        }
        await LoginService.createWeChatSession(openid, session_key);
        const employeeData = await getEmployeeByOpenId(openid);
        if (!employeeData || !employeeData?.isActive) {
            res.json({ success: true, openid });
        }
        res.json({ success: true, openid, employee: true, employee_name: `${employeeData.last_name}${employeeData.first_name}`, department: employeeData.department });
    } catch (err) {
        console.error('wechat_sessionsController: postWechatLogin: caught error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.postWechatRenew = async (req, res) => {
    try {
        const { openid } = req.body;
        if (!openid)
            throw new Error('bad request payload');
        const session = await LoginService.getWechatSessionByOpenId(openid);
        if (!session) {
            console.log('wechat_sessionsController: postWechatRenew: no session found for openid: ' + openid);
            return res.json({ success: false, message: 'logout' });
        }
        const employeeData = await getEmployeeByOpenId(openid);
        if (!employeeData || !employeeData?.isActive) {
            res.json({ success: true, openid });
        }
        res.json({ success: true, openid, employee: true, employee_name: `${employeeData.last_name}${employeeData.first_name}`, department: employeeData.department });

    } catch (err) {
        console.error('wechat_sessionsController: postWechatRenew: caught error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
