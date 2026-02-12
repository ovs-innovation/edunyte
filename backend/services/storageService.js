import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadRecording = async (localFilePath, bookingId, meetingId) => {
  try {
    const url = await uploadToS3(localFilePath, bookingId, meetingId);
    await cleanupLocalFile(localFilePath);
    return { url, provider: "s3" };
  } catch (error) {
    await cleanupLocalFile(localFilePath);
    throw error;
  }
};

const uploadToS3 = async (localFilePath, bookingId, meetingId) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const key = `recordings/${bookingId}/${meetingId}.mp4`;

  const fileStream = fs.createReadStream(localFilePath);
  const stats = fs.statSync(localFilePath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    ContentType: "video/mp4",
    ContentLength: stats.size,
    Metadata: {
      bookingId: bookingId,
      meetingId: meetingId,
    },
  });

  await s3Client.send(command);

  const region = process.env.AWS_REGION || "us-east-1";
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

const cleanupLocalFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`✓ Cleaned up local file: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Failed to clean up local file: ${filePath}`, error.message);
  }
};

export const generateSignedUrl = async (recordingUrl, userRole, expiryHours = 24) => {
  return recordingUrl;
};
