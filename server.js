const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

const {ROUTES} = require("./routes"); 
const {setupLogging} = require("./logging"); 
const {setupProxies} = require("./proxy"); 
const {setupAuth} = require("./auth"); 
const {setupRateLimit} = require("./rateLimit"); 

require('dotenv').config();
require('./config/connect');
require('./config/cosmosdb');
require('./config/blobStorage');

const app = express();
setupLogging(app);
setupRateLimit (app, ROUTES); 
setupAuth (app, ROUTES); 
setupProxies (app, ROUTES); 

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));

app.use(cookieParser());


const port = process.env.API_GATEWAY_PORT || 3000;
app.listen(port, () => console.log(`API Gateway started on port ${port}...`));
