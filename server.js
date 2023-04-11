const express = require("express");
const cors = require ('cors');
const bodyParser = require('body-parser');
const authAnnonceurApi = require('./authService/routes/annonceurRoute');
const authAdminApi = require('./authService/routes/adminRoute');
const accountAdminApi = require('./accountService/routes.js/adminRoute.js');
const accountAnnonceurApi = require('./accountService/routes.js/annonceurRoute.js');
const accountSharedApi = require('./accountService/routes.js/sharedRoute.js');


require("dotenv").config();
require('./config/connect');

const app = express();

app.use(bodyParser.json());

app.use(cors(
    {
        origin: "http://localhost:4200"
    }
));

app.use('/annonceur', authAnnonceurApi, accountAnnonceurApi);
app.use('/admin', authAdminApi, accountAdminApi);
app.use('/', accountSharedApi);

app.listen()

const port = process.env.PORT
app.listen(port, 
()=> console.log(`Server Started on port ${port}...`))

