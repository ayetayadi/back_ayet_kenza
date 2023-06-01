const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');
const annonceurMiddleware = require('../middleware/annonceurMiddleware');


router.post('/payementwithFlouci', annonceurController.payementwithFlouci);
router.post('/payementwithFlouci/:id', annonceurController.verify);
router.post('/payement/:email/:offreId', annonceurController.payement);
router.get('/voirFactures',annonceurMiddleware.verifyTokenEmail, annonceurController.voirFactures);



module.exports = router;