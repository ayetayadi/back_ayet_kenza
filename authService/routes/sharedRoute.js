const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');


router.post('/forgotPassword', sharedController.forgotPassword);

module.exports = router;