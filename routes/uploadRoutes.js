const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/media', uploadController.uploadMedia);

module.exports = router;
