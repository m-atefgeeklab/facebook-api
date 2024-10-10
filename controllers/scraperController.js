const postQueue = require("../queues/postQueue");
const logger = require("../utils/logger");
const Account = require("../models/SocialMediaAccount");
const Group = require("../models/SocialMediaGroups");
const Campaign = require("../models/CampaignModel");

const scrapeAndPost = async (req, res) => {
  let { brandId, postContent, scheduleDate, delayTime, numberOfJobsPerDelay } =
    req.body;

  try {
    // Find the account based on brandId
    const account = await Account.findOne({
      brand: brandId,
      platform: "FACEBOOK",
    });
    if (!account) {
      logger.error("Account not found.");
      return res.status(404).json({ message: "Account not found." });
    }

    // Create a new campaign for this brand
    const newCampaign = new Campaign({
      brand: brandId,
      platform: "FACEBOOK",
      content: postContent,
      status: scheduleDate ? "scheduled" : "running",
      timestamp: Date.now(),
    });
    await newCampaign.save();
    logger.info(`Campaign created with ID: ${newCampaign._id}`);

    // Find all groups associated with the brandId
    const groups = await Group.find({ brand: brandId, platform: "FACEBOOK" });
    if (!groups || groups.length === 0) {
      logger.error("No groups found for this brand.");
      return res
        .status(404)
        .json({ message: "No groups found for this brand." });
    }

    // Define job options for queueing
    let jobOptions = {
      attempts: 5,
      backoff: 10000,
      removeOnComplete: true,
      removeOnFail: true,
    };

    // If scheduleDate is provided, calculate the delay
    if (scheduleDate) {
      const now = Date.now();
      const delay = scheduleDate - now;

      if (delay <= 0) {
        return res
          .status(400)
          .json({ message: "Scheduled time must be in the future." });
      }

      jobOptions.delay = delay;
    }

    // Add posts to queue with dynamic delay between jobs
    let delayCounter = 0;
    for (let i = 0; i < groups.length; i++) {
      // Apply dynamic delay after every 'numberOfJobsPerDelay' jobs
      if (
        delayTime &&
        numberOfJobsPerDelay &&
        i % numberOfJobsPerDelay === 0 &&
        i !== 0
      ) {
        delayCounter += delayTime * 60000; // Convert delayTime to milliseconds (e.g., 20 minutes)
      }

      // Set the job-specific delay
      let jobSpecificOptions = {
        ...jobOptions,
        delay: (jobOptions.delay || 0) + delayCounter, // Add dynamic delay to each job
      };

      // Queue the job
      await postQueue.add(
        {
          brandId: account.brand,
          groupId: groups[i].group_id,
          postContent,
          campaignId: newCampaign._id,
        },
        jobSpecificOptions
      );
    }

    res
      .status(200)
      .json({
        message: scheduleDate
          ? "Post requests scheduled."
          : "Post requests received and will be processed immediately.",
      });
  } catch (error) {
    logger.error(`Error in scrapeAndPost: ${error.message}`);
    res
      .status(500)
      .json({ message: "Failed to queue posts", error: error.message });
  }
};

module.exports = { scrapeAndPost };
