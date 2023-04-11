const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/add', adminController.add);
router.post('/login', adminController.login);

module.exports = router;
