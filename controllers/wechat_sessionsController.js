const pool = require('../config/db');
const axios = require('axios');

exports.postWechatLogin = async (req, res) => {
    const { code } = req.body;
    if (!code) {
        res.status(400).json({ success: false, message: 'Code required' });
    }
    try {
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
            return res.status(400).json({ success: false, message: errmsg });
        }
        // store session_key and openid in database
        pool.query(
            `INSERT INTO wechat_sessions (openid, session_key) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE session_key = ?, updated_at = CURRENT_TIMESTAMP`,
            [openid, session_key, session_key],
            (err, result) => {
                if (err) {
                    console.error('Error storing session data: ', err)
                    return res.status(500).json({ success: false, message: 'db error' });
                }
                res.json({ success: true, openid });
            }
        )
    } catch (err) {
        console.error('Error during WeChat login: ', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};