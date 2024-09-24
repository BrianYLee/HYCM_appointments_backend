const pool = require('../config/db');

const getWechatSessionByOpenId = (openid) => {
    return new Promise((res, rej) => {
        const query = 'SELECT * FROM wechat_sessions WHERE openid = ?';
        pool.query(query, [openid], (error, result) => {
            if (error) return rej(error);
            if (result.length === 0) res(null);
            res(result[0]);
        });
    });
}

const createWeChatSession = (openid, session_key) => {
    return new Promise((res, rej) => {
        const query =
            `INSERT INTO wechat_sessions (openid, session_key) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE session_key = ?, updated_at = CURRENT_TIMESTAMP`;
        pool.query(query, [openid, session_key, session_key], (error, result) => {
            if (error) return rej(error);
            res(result);
        });
    });
};

module.exports = {
    getWechatSessionByOpenId,
    createWeChatSession
};
