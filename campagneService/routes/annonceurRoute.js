const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');
const middleware = require('../middleware/annonceurMiddleware');

router.post('/createCampagne', middleware.verifyTokenId, annonceurController.createCampagne);
router.get('/getAllCampagnes', middleware.verifyTokenId, annonceurController.getAllCampagnes);
router.put('/updateCampagne/:nom', middleware.verifyTokenId, annonceurController.updateCampagne);
router.delete('/deleteCampagne/:nom', middleware.verifyTokenId, annonceurController.deleteCampagne);

module.exports = router;
