const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');
const middleware = require('../middlewares/annonceurMiddleware');

router.post('/createBannerWithImageUpload/:nom_campagne',middleware.verifyTokenId, annonceurController.createBannerWithImageUpload);
router.post('/createBannerWithEditor/:nom_campagne',middleware.verifyTokenId, annonceurController.createBannerWithEditor);
router.get('/getAllBannersByCampagne/:nom_campagne', middleware.verifyTokenId, annonceurController.getAllBannersByCampagne);
router.get('/getAllBanners', middleware.verifyTokenId, annonceurController.getAllBanners);
router.get('/getAllBannersByAnnonceur', middleware.verifyTokenId, annonceurController.getAllBannersByAnnonceur);
router.get('/getBannerById/:id_banner', annonceurController.getBannerById);
router.put('/updateBannerById/:id_banner', annonceurController.updateBannerById);
router.delete('/deleteBanner/:nom_campagne/:nom', middleware.verifyTokenId, annonceurController.deleteBanner);
router.delete('/deleteAllBanners/:nom_campagne', middleware.verifyTokenId, annonceurController.deleteAllBanners);
router.put('/updateBanner/:nom_campagne/:nom',middleware.verifyTokenId, annonceurController.updateBanner);
router.get('/getRapportByBanner/:nom_campagne/:nom', annonceurController.getRapportByBanner);

module.exports = router;