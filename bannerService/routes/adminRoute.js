const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const middleware = require('../middlewares/adminMiddleware');

router.post('/authoriserBanner/:nom', middleware.verifyTokenId,adminController.authoriserBanner);
router.get('/getAllBannersAuthorisationsByAnnonceur/:nom/:email', adminController.getAllBannersAuthorisationsByAnnonceur);

module.exports = router;