const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');

router.post('/register', annonceurController.register);
router.post('/login', annonceurController.login);
router.post('/forgotPassword', annonceurController.forgotPassword);
router.post('/resetPassword', annonceurController.resetPassword);

module.exports = router;