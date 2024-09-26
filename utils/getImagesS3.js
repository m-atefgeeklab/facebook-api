const fs = require('fs');
const path = require('path');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../config/awsConfig');
const util = require('util');
const os = require('os');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

const downloadFromS3 = async (bucket, key) => {
  const downloadPath = path.join(os.tmpdir(), key.split('/').pop()); // Save to temp folder

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const { Body } = await s3.send(command);

    // Stream data to a local file
    await pipeline(Body, fs.createWriteStream(downloadPath));
    console.log(`Downloaded ${key} to ${downloadPath}`);
    return downloadPath;
  } catch (error) {
    console.error(`Error downloading ${key} from S3:`, error);
    throw error;
  }
};

module.exports = downloadFromS3;
