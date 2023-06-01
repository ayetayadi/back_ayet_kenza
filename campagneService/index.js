const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const campagneAnnonceurApi = require('./routes/annonceurRoute');
const campagneAdminApi = require('./routes/adminRoute');

require('dotenv').config();
require('../config/connect');


const app = express();
const port = process.env.CAMPAGNE_PORT || 3004;

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/campagneService/annonceur', campagneAnnonceurApi);
app.use('/campagneService/admin', campagneAdminApi);

app.listen(port, () => console.log(`Server started on port ${port}...`));
