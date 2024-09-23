require('dotenv').config();
const express = require('express');
const scraperRoutes = require('./routes/scraperRoutes');
const logger = require('./utils/logger');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define API routes
app.use('/api/v1/groups', scraperRoutes);

// Static directory for serving uploaded files (if needed)
app.use('/uploads', express.static('uploads'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
