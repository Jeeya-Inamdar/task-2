import dotenv from "dotenv";
import AWS from "aws-sdk";
import AWSMaintenanceModeMessage from "aws-sdk/lib/maintenance_mode_message.js";

dotenv.config();

// Suppress AWS SDK maintenance mode message
AWSMaintenanceModeMessage.suppress = true;

// Initialize S3 instance
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

// Initialize SES instance
const SES = new AWS.SES({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export { s3, SES };
