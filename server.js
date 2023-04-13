const express = require("express");
const cors = require ('cors');
const bodyParser = require('body-parser');
const authAnnonceurApi = require('./authService/routes/annonceurRoute');
const authAdminApi = require('./authService/routes/adminRoute');
const accountAdminApi = require('./accountService/routes.js/adminRoute.js');
const accountAnnonceurApi = require('./accountService/routes.js/annonceurRoute.js');
const accountSharedApi = require('./accountService/routes.js/sharedRoute.js');
const teamAdminApi = require('./teamService/routes/adminRoute');
const teamAnnonceurApi = require('./teamService/routes/annonceurRoute');
const teamMembreApi = require('./teamService/routes/membreRoute');

require("dotenv").config();
require('./config/connect');

const app = express();

app.use(bodyParser.json());

app.use(cors(
    {
        origin: "http://localhost:4200"
    }
));

app.use('/annonceur', authAnnonceurApi, accountAnnonceurApi, teamAnnonceurApi);
app.use('/admin', authAdminApi, accountAdminApi, teamAdminApi);
app.use('/membre', teamMembreApi);
app.use('/', accountSharedApi);

app.listen()

const port = process.env.PORT
app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))

