const { createAwsClient } = require('../utils/awsUtils');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = createAwsClient(S3Client);

module.exports = { s3 };
