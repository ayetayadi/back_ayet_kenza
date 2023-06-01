const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const teamAnnonceurApi = require('./routes/annonceurRoute');
const teamMembreApi = require('./routes/membreRoute');
const teamAdminApi = require('./routes/adminRoute');

require('dotenv').config();
require('../config/connect');


const app = express();
const port = process.env.TEAM_PORT || 3003;

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/teamService/annonceur', teamAnnonceurApi);
app.use('/teamService/admin', teamAdminApi);
app.use('/teamService/membre', teamMembreApi);

app.listen(port, () => console.log(`Server started on port ${port}...`));
