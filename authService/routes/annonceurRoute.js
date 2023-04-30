const express = require('express');
const router = express.Router();
const annonceurController = require('../controllers/annonceurController');

router.post('/register', annonceurController.register);
router.post('/login', annonceurController.login);
router.post('/refreshToken', annonceurController.refreshToken);
router.get('/protected', annonceurController.authenticateAnnonceur, (req, res) => {
    res.send('This is a protected route');
});

router.post('/logout', annonceurController.logout);

module.exports = router;