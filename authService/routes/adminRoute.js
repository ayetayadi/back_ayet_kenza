const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/add', adminController.add);
router.post('/login', adminController.login);
router.post('/refreshToken', adminController.refreshToken);
router.get('/protected', adminController.authenticateAdmin, (req, res) => {
    res.send('This is a protected route');
});

router.post('/logout', adminController.logout);
module.exports = router;
