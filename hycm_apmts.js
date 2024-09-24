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
const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');

app.use('/appointments', appointmentsRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);

// Start the server
app.listen(port, () => {
    console.log(`hycm_apmts_app Server running on port ${port}`);
});
