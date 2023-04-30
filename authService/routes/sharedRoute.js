const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');


router.post('/forgotPassword', sharedController.forgotPassword);
router.post('/resetPassword', sharedController.resetPassword);

module.exports = router;