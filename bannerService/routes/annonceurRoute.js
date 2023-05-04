const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');
const middleware = require('../middlewares/annonceurMiddleware');



router.post('/createBannerWithImageUpload/:nom_campagne',middleware.verifyTokenId, annonceurController.createBannerWithImageUpload);
router.post('/createBannerWithEditor/:nom_campagne',middleware.verifyTokenId, annonceurController.createBannerWithEditor);
router.get('/getAllBannersByCampagne/:nom_campagne', middleware.verifyTokenId, annonceurController.getAllBannersByCampagne);
router.get('/getBannerById/:id_banner', annonceurController.getBannerById);
router.put('/updateBannerById/:id_banner', annonceurController.updateBannerById);
router.delete('/deleteBanner/:nom', middleware.verifyTokenId, annonceurController.deleteBanner);
router.delete('/deleteb/:id', middleware.verifyTokenId, annonceurController.deleteb);

module.exports = router;