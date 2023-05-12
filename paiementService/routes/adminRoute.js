const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.post('/createOffre', adminController.createOffre);
router.put('/updateOffre/:id', adminController.updateOffre);
router.delete('/deleteOffre/:id', adminController.deleteOffre);
router.get('/getOffres', adminController.getOffres);


module.exports = router;