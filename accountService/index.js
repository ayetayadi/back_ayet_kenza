const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const accountAnnonceurApi = require('./routes/annonceurRoute');
const accountSharedApi = require('./routes/sharedRoute');
const accountAdminApi = require('./routes/adminRoute');

require('dotenv').config();
require('../config/connect');


const app = express();
const port = process.env.ACCOUNT_PORT || 3001;

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
  }));

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/accountService/annonceur', accountAnnonceurApi);
app.use('/accountService/admin', accountAdminApi);
app.use('/accountService/', accountSharedApi);

app.listen(port, () => console.log(`Server started on port ${port}...`));
