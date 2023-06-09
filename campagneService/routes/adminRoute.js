const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/getCampagnesByAnnonceur/:email', adminController.getCampagnesByAnnonceur);

module.exports = router;