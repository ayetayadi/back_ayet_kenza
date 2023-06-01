const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authAnnonceurApi = require('./routes/annonceurRoute');
const authSharedApi = require('./routes/sharedRoute');
const authAdminApi = require('./routes/adminRoute');
const authMemberApi = require('./routes/membreRoute');

require('dotenv').config();
require('../config/connect');

const app = express();
const port = process.env.AUTH_PORT || 3001;

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/authService/annonceur', authAnnonceurApi);
app.use('/authService/admin', authAdminApi);
app.use('/authService/membre', authMemberApi);
app.use('/authService/', authSharedApi);

app.listen(port, () => console.log(`Server started on port ${port}...`));
