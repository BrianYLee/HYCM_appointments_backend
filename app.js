require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();
const port = process.env.APP_PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routers
const appointmentsRoute = require('./routes/appointments');
const wechat_sessionsRoute = require('./routes/wechat_sessions');

app.use('/api/appointments', appointmentsRoute);
app.use('/api/wechatlogin', wechat_sessionsRoute);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
