const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');

router.post('/register', annonceurController.register);
router.post('/login', annonceurController.login);


module.exports = router;