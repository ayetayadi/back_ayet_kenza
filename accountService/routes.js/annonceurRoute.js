const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');
const middleware = require('../middleware/annonceurMiddleware');


router.post('/forgotPassword', annonceurController.forgotPassword);
router.post('/resetPassword', annonceurController.resetPassword);
router.get('/profile', middleware.verifyToken, annonceurController.profile);
router.put('/editProfile', middleware.verifyToken, annonceurController.editProfile);
router.post('/changePassword', annonceurController.changePassword);
router.post('/resetPassword', annonceurController.resetPassword);


module.exports = router;
