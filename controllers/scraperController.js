const postQueue = require('../queues/postQueue');
const logger = require("../utils/logger");
const { uploadToS3 } = require("../utils/multerS3Config");

async function scrapeAndPost(req, res) {
  const { email, password, groupId, postContent } = req.body;
  const { files } = req; // Extract files directly

  try {
    // Handle image upload to S3 before adding the job to the queue
    let imageKeys = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const s3Key = await uploadToS3(file);
        imageKeys.push(s3Key);
      }
    }

    // Add the job to the queue with necessary data (without req)
    await postQueue.add(
      { email, password, groupId, postContent, imageKeys }, // Pass imageKeys instead of req
      {
        attempts: 5, // Retry up to 5 times
        backoff: 10000, // 10 seconds delay between retries
      }
    );

    // Respond immediately to the user
    res.status(200).json({ message: "Post request received. It will be processed shortly." });
  } catch (error) {
    logger.error(`Error in scrapeAndPost: ${error.message}`);
    res.status(500).json({ message: "Failed to queue post", error: error.message });
  }
}

module.exports = { scrapeAndPost };


// const postQueue = require('../queues/postQueue');
// const logger = require("../utils/logger");
// const { uploadToS3 } = require('../utils/multerS3Config');

// async function scrapeAndPost(req, res) {
//   const { email, password, groupId, postContent } = req.body;
//   const { files } = req;
//   let imageKeys = [];

//   try {
//     // Upload images to S3 if there are any files in the request
//     if (files && files.length > 0) {
//       for (const file of files) {
//         const s3Key = await uploadToS3(file);
//         imageKeys.push(s3Key);
//       }
//     }

//     // Add the job to the queue with only necessary data
//     await postQueue.add({
//       email,
//       password,
//       groupId,
//       postContent,
//       imageKeys,
//     });

//     // Respond immediately to the user
//     res.status(200).json({ message: "Post request received. It will be processed shortly." });
//   } catch (error) {
//     // Log error if any issue occurs
//     logger.error(`Error in scrapeAndPost: ${error.message}`);
//     res.status(500).json({ message: "Failed to queue post", error: error.message });
//   }
// }

// module.exports = { scrapeAndPost };
