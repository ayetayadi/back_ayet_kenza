const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bannerAnnonceurApi = require('./routes/annonceurRoute');
const bannerAdminApi = require('./routes/adminRoute');

require('dotenv').config();
require('../config/connect');
require('../config/cosmosdb');
require('../config/blobStorage');

const app = express();
const port = process.env.BANNER_PORT || 3005;

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/bannerService/annonceur', bannerAnnonceurApi);
app.use('/bannerService/admin', bannerAdminApi);

app.listen(port, () => console.log(`Server started on port ${port}...`));
