const express = require('express');
const { scrapeAndPost } = require('../controllers/scraperController');

const router = express.Router();

// Route to handle scraping and posting data
router.post('/create-post', scrapeAndPost);

module.exports = router;
