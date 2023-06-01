const morgan = require("morgan"); 

const setupLogging = (app) => { 
    app.use( morgan ('combiné')); 
} 

exports.setupLogging = setupLogging