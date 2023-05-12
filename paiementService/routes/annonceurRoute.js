const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');


router.post('/payer/:id/:offreId', annonceurController.payer);



module.exports = router;