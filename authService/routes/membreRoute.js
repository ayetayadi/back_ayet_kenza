const express = require('express');
const router = express.Router();
const membreController = require('../controllers/membreController');


router.post('/acceptInvitation', membreController.acceptInvitation);

module.exports = router;