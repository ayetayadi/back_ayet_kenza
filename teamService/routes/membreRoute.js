const express = require('express');
const router = express.Router();
const membreController = require('../controllers/membreController');


router.post('/acceptInvitation', membreController.acceptInvitation);
router.get('/getTeamMembers', membreController.getTeamMembers);

module.exports = router;
