const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');
const middleware = require('../middleware/annonceurMiddleware');


router.post('/createTeam', middleware.verifyTokenId, annonceurController.createTeam);
router.get('/getTeams', middleware.verifyTokenId, annonceurController.getTeams);
router.put('/updateTeam/:name', middleware.verifyTokenId, annonceurController.updateTeam);
router.delete('/deleteTeam/:name', middleware.verifyTokenId, annonceurController.deleteTeam);
router.post('/inviteMember', middleware.verifyTokenId, annonceurController.inviteMember);
router.get('/getMembersByTeam/:nom', annonceurController.getMembersByTeam);4
router.delete('/deleteMember', annonceurController.deleteMember);

module.exports = router;