const path = require('path');
require('dotenv').config();
const express = require('express');
const scraperRoutes = require('./routes/scraperRoutes');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const postQueue = require('./queues/postQueue');
const logger = require('./utils/logger');
const dbConnection = require("./config/database");

// Create the Express adapter for Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// Initialize Bull Board with the queue
createBullBoard({
  queues: [new BullAdapter(postQueue)],
  serverAdapter: serverAdapter,
});

// Initialize the application
const app = express();

// Connect with the database
dbConnection();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

// Route for Bull Board monitoring
app.use('/admin/queues', serverAdapter.getRouter()); // Use getRouter()

// Define API routes
app.use('/api/v1/groups', scraperRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// sudo lsof -i :6379
// sudo kill <PID>
// redis-server --port 6380
// docker build -t puppeteer-scraper .
// docker run -it puppeteer-scraper
// docker-compose -f docker-compose.yml -f docker-compose.dev.yml up // For Development
// docker-compose up // For Production
// docker-compose up // For Development
// NODE_ENV=production docker-compose up --build // For Production
