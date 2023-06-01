const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');

router.get('/verifyRole',sharedController.verifyRole);
router.get('/getToken',sharedController.getToken);
router.post('/resetPassword',sharedController.resetPassword);

module.exports = router;
