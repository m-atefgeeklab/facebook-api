const express = require('express');
const { createAccount, createGroup } = require('../controllers/facebookController');
const router = express.Router();

// Route to handle scraping and posting data
router.post('/create-account', createAccount);
router.post('/create-group', createGroup);

module.exports = router;
