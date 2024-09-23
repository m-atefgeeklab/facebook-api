const express = require('express');
const { scrapeAndPost } = require('../controllers/scraperController');
const multerConfig = require('../utils/multer');

const router = express.Router();

// Route to handle scraping and posting data
router.post('/create-post', multerConfig.uploadMultiple, scrapeAndPost);

module.exports = router;
