const Bull = require('bull');
const { scrapeAndPostData } = require('../services/scraperService');
const facebookConfig = require('../config/facebook');
const logger = require('../utils/logger');
const Campaign = require('../models/CampaignModel');

const postQueue = new Bull('postQueue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASS || '',
  },
});

let currentCampaignId = null;

// Process the queue jobs
postQueue.process(async (job) => {
  const { brandId, groupId, postContent, campaignId } = job.data;

  if (!currentCampaignId) {
    currentCampaignId = campaignId;
    await Campaign.updateOne({ _id: currentCampaignId }, { status: 'running' });
  }

  try {
    logger.info(`Processing job ${job.id}: brandId: ${brandId}, groupId: ${groupId}, campaignId: ${campaignId}`);

    // Execute the scraper and post data
    await scrapeAndPostData(facebookConfig, brandId, groupId, postContent, currentCampaignId);

    logger.info(`Job ${job.id} completed successfully.`);
  } catch (error) {
    logger.error(`Job ${job.id} failed: ${error.message}`);
    
    // Update the campaign status to failed if the job fails
    await Campaign.updateOne({ _id: currentCampaignId }, { status: 'failed' });
    
    // Ensure the error is thrown to handle in the failure event listener
    throw error;
  }
});

/** 
 * Event listeners for queue logging and state management
 */

// Log when a job starts processing
postQueue.on('active', (job) => {
  logger.info(`Job ${job.id} started processing with data: ${JSON.stringify(job.data)}`);
});

// Log when a job completes successfully
postQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully.`);
});

// Log when a job fails
postQueue.on('failed', async (job, error) => {
  logger.error(`Job ${job.id} failed: ${error.message}`);

  // Update the campaign status to failed
  await Campaign.updateOne({ _id: job.data.campaignId }, { status: 'failed' });
});

// Update campaign status to 'finished' when the queue is drained
postQueue.on('drained', async () => {
  if (currentCampaignId) {
    await Campaign.updateOne({ _id: currentCampaignId }, { status: 'finished' });
    logger.info(`Campaign ${currentCampaignId} finished.`);
    currentCampaignId = null;
  }
});

// Log when the queue is waiting for the next job
postQueue.on('waiting', (jobId) => {
  logger.info(`Queue is waiting for job ${jobId} to be processed.`);
});

// Log when the queue is paused
postQueue.on('paused', () => {
  logger.info('The queue has been paused.');
});

// Log when the queue resumes processing
postQueue.on('resumed', (job) => {
  logger.info(`The queue has resumed processing job ${job?.id || 'N/A'}.`);
});

module.exports = postQueue;
