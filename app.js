const path = require('path');
require('dotenv').config();
const express = require('express');
const scraperRoutes = require('./routes/scraperRoutes');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const postQueue = require('./queues/postQueue');
const cors = require('cors');
const logger = require('./utils/logger');
const dbConnection = require("./config/database");
const cron = require('node-cron'); // Import node-cron
const { scrapeAndGetGroupMembers } = require('./services/scraperService');
const Account = require('./models/SocialMediaAccount');
const Group = require('./models/SocialMediaGroups');
const facebookConfig = require('./config/facebook');

// Create the Express adapter for Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// Initialize Bull Board with the queue
createBullBoard({
  queues: [new BullAdapter(postQueue)],
  serverAdapter: serverAdapter,
});

// Connect with the database
dbConnection();

// Initialize the application
const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

// Route for Bull Board monitoring
app.use('/admin/queues', serverAdapter.getRouter()); // Use getRouter()

// Define API routes
app.use('/api/v1/groups', scraperRoutes);

// Cron job to scrape group members for all brand accounts
cron.schedule('*/30 * * * *', async () => {
  try {
    logger.info('Running cron job to scrape group members for all brand accounts...');

    const accounts = await Account.find({ platform: 'FACEBOOK' });

    for (const account of accounts) {
      const { brand } = account;
      logger.info(`Scraping groups for brand: ${account.brand}`);

      const groups = await Group.find({ brand: brand, platform: 'FACEBOOK' });

      for (const group of groups) {
        const { group_id: groupId } = group;
        logger.info(`Scraping group: ${groupId} for brand: ${account.brand}`);

        await scrapeAndGetGroupMembers(facebookConfig, brand, groupId);
      }
    }

    logger.info('Cron job completed successfully for all brand accounts.');
  } catch (error) {
    logger.error(`Cron job failed: ${error.message}`);
  }
});

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
