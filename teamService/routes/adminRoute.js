const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/getTeamsByAnnonceur/:email', adminController.getTeamsByAnnonceur);

module.exports = router;