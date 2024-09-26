const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../config/awsConfig');
const path = require('path');
const os = require('os');
const fs = require('fs');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tempDir = os.tmpdir(); // Save to OS temp directory
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif/;
    const extension = file.originalname.split('.').pop().toLowerCase();
    if (allowedExtensions.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images allowed!'), false);
    }
  }
});

const uploadToS3 = async (file) => {
  const filePath = path.join(os.tmpdir(), file.filename);

  try {
    const fileStream = fs.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `facebook-images/${Date.now()}-${file.originalname}`,
      Body: fileStream,
      ContentType: file.mimetype,
      ACL: 'public-read-write',
    });

    await s3.send(command);
    console.log(`File uploaded: ${file.originalname}`);
    return command.input.Key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  } finally {
    fs.unlinkSync(filePath); // Clean up the temp file after upload
  }
};

module.exports = {
  uploadMultiple: upload.array('files', 10),
  uploadToS3
};
