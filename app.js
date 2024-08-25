require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3303;

app.use(bodyParser.json());

// wechat miniprogram app environment
const appId = process.env.WECHAT_APP_ID;
const appSecret = process.env.WECHAT_APP_SECRET;

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA
});

// Connect to the MySQL database
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoint to handle WeChat login
app.post('/api/wechat-login', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  try {
    // Get session_key and openid from WeChat API
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: appId,
        secret: appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = response.data;

    if (errcode) {
      return res.status(400).json({ success: false, message: errmsg });
    }

    // Store session_key and openid in the database
    db.query(
      `INSERT INTO wechat_sessions (openid, session_key) VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE session_key = ?, updated_at = CURRENT_TIMESTAMP`,
      [openid, session_key, session_key],
      (err, result) => {
        if (err) {
          console.error('Error storing session data:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error',
          });
        }

        // Return the session_key and openid to the client
        res.json({
          success: true,
          //session_key,
          openid,
        });
      }
    );
/*
    return res.json({
      success: true,
      openid,
      session_key,
      userInfo: { openid }
    });
*/
  } catch (error) {
    console.error('Error during WeChat login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// API endpoint to retrieve user session information (optional)
app.get('/api/user-session/:openid', (req, res) => {
  const { openid } = req.params;

  db.query(
    `SELECT * FROM wechat_sessions WHERE openid = ?`,
    [openid],
    (err, results) => {
      if (err) {
        console.error('Error retrieving session data:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: results[0],
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});