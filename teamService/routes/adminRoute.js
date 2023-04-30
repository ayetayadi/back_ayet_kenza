const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/getTeamsByAnnonceur/:username', adminController.getTeamsByAnnonceur);

module.exports = router;