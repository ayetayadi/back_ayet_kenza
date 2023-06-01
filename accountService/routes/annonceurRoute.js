const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');
const middleware = require('../middleware/annonceurMiddleware');


router.get('/profile', middleware.verifyToken, annonceurController.profile);
router.put('/editProfile', middleware.verifyToken, annonceurController.editProfile);
router.get('/getPermission', middleware.verifyTokenId, annonceurController.getPermission);


module.exports = router;
