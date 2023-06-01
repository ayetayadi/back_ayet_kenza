const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.post('/createOffre', adminController.createOffre);
router.put('/updateOffre/:nomPack', adminController.updateOffre);
router.delete('/deleteOffre/:nomPack', adminController.deleteOffre);
router.get('/getOffres', adminController.getOffres);
router.get('/getAnnonceursFactures', adminController.getAnnonceursFactures);


module.exports = router;