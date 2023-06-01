const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.delete('/deleteAnnonceur/:email', adminController.deleteAnnonceur);
router.put('/editAnnonceur/:email', adminController.editAnnonceur);
router.post('/addAnnonceur', adminController.addAnnonceur);
router.get('/getAll', adminController.getAll);

module.exports = router;