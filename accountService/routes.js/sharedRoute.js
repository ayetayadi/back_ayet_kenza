const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');

router.get('/verifyRole', sharedController.verifyRole);

module.exports = router;
