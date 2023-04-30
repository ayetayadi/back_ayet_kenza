const express = require("express");
const cors = require ('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authAnnonceurApi = require('./authService/routes/annonceurRoute');
const authSharedApi = require('./authService/routes/sharedRoute');
const authAdminApi = require('./authService/routes/adminRoute');
const accountAdminApi = require('./accountService/routes.js/adminRoute.js');
const accountAnnonceurApi = require('./accountService/routes.js/annonceurRoute.js');
const accountSharedApi = require('./accountService/routes.js/sharedRoute.js');
const teamAdminApi = require('./teamService/routes/adminRoute');
const teamAnnonceurApi = require('./teamService/routes/annonceurRoute');
const teamMembreApi = require('./teamService/routes/membreRoute');
const campagneAnnonceurApi = require('./campagneService/routes/annonceurRoute');
const campagneAdminApi = require('./campagneService/routes/adminRoute');
const bannerAnnoceurApi = require('./bannerService/routes/annonceurRoute');

require("dotenv").config();
require('./config/connect');
require('./config/rabbitmq');
require('./config/cosmosdb');

const app = express();
app.use(cookieParser());

app.use(bodyParser.json());

app.use(cors(
    {
        origin: "http://localhost:4200",
        credentials: true

    }
));

app.use('/annonceur', authAnnonceurApi, accountAnnonceurApi, teamAnnonceurApi,campagneAnnonceurApi, bannerAnnoceurApi);
app.use('/admin', authAdminApi, accountAdminApi, teamAdminApi, campagneAdminApi);
app.use('/membre', teamMembreApi);
app.use('/', authSharedApi, accountSharedApi);

app.listen()

const port = process.env.PORT
app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))

