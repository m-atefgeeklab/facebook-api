const path = require('path');

require('dotenv').config();
const express = require('express');
const scraperRoutes = require('./routes/scraperRoutes');
const logger = require('./utils/logger');
const dbConnection = require("./config/database");

// Connect with db
dbConnection();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

// Define API routes
app.use('/api/v1/groups', scraperRoutes);

// Static directory for serving uploaded files (if needed)
app.use('/uploads', express.static('uploads'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// docker build -t puppeteer-scraper .
// docker run -it puppeteer-scraper