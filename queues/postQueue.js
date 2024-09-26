const Bull = require('bull');
const { scrapeAndPostData } = require('../services/scraperService');
const facebookConfig = require('../config/facebook');
const logger = require("../utils/logger");

// Initialize the queue
const postQueue = new Bull('postQueue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6380,
  },
});

// Process the queue with scrape and post tasks
postQueue.process(async (job) => {
  const { email, password, groupId, postContent, imageKeys } = job.data;

  try {
    // Call your function with the extracted image keys and other data
    await scrapeAndPostData(facebookConfig, { email, password, groupId, postContent, imageKeys });
    logger.info("Post published successfully.");
  } catch (error) {
    logger.error(`Error processing job: ${error.message}`);
    throw error;
  }
});

module.exports = postQueue;
