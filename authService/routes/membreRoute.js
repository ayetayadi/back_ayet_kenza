const express = require('express');
const router = express.Router();
const membreController = require('../controllers/membreController');


router.post('/acceptInvitation', membreController.acceptInvitation);
router.post('/logout', membreController.logout);

module.exports = router;