const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const paiementAnnonceurApi = require('./routes/annonceurRoute');
const paiementAdminApi = require('./routes/adminRoute');

require('dotenv').config();
require('../config/connect');


const app = express();
const port = process.env.PAIEMENT_PORT || 3006;

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/paiementService/annonceur', paiementAnnonceurApi);
app.use('/paiementService/admin', paiementAdminApi);

app.listen(port, () => console.log(`Server started on port ${port}...`));
