import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Booking from "../models/bookingModel.js";
import { uploadRecording } from "./storageService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, "../temp/recordings");
const MAX_RETRY_ATTEMPTS = 3;

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const getZoomAccessToken = async () => {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom OAuth credentials missing");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const resp = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    null,
    {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 10000,
    }
  );

  return resp.data?.access_token;
};

export const fetchZoomRecording = async (meetingId) => {
  try {
    const token = await getZoomAccessToken();

    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    const recordingFiles = data.recording_files || [];
    const mp4Recording = recordingFiles.find(
      (file) => file.file_type === "MP4" && file.recording_type !== "audio_only"
    );

    if (!mp4Recording) {
      console.log(`No MP4 recording found for meeting ${meetingId}`);
      return null;
    }

    return {
      recordingId: mp4Recording.id,
      downloadUrl: mp4Recording.download_url,
      duration: data.duration || mp4Recording.recording_end ? 
        Math.floor((new Date(mp4Recording.recording_end) - new Date(mp4Recording.recording_start)) / 1000) : 
        0,
      recordingStart: mp4Recording.recording_start,
      recordingEnd: mp4Recording.recording_end,
      fileSize: mp4Recording.file_size || 0,
      recordingType: mp4Recording.recording_type || "",
      status: data.recording_count > 0 ? "available" : "processing",
    };
  } catch (error) {
    if (error.response) {
      console.error(`Zoom API Error for meeting ${meetingId}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      
      const errorMessage = JSON.stringify(error.response.data);
      if (errorMessage.includes("scope") || errorMessage.includes("Invalid access token")) {
        console.error("⚠️  ACTION REQUIRED: Please check your Zoom App Scopes in the Marketplace.");
        console.error("    Missing Scope: cloud_recording:read:list_recording_files:admin (or similar recording read scope)");
      }
    } else {
      console.error(`Zoom API Error for meeting ${meetingId}: ${error.message}`);
    }
    
    if (error.response?.status === 404) {
      console.log(`Recording not found for meeting ${meetingId}`);
      return null;
    }
    throw error;
  }
};

const deleteZoomRecording = async (meetingId) => {
  try {
    const token = await getZoomAccessToken();

    console.log(`Deleting Zoom cloud recording for meeting ${meetingId}...`);
    
    await axios.delete(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log(`✓ Successfully deleted Zoom cloud recording for meeting ${meetingId}`);
    return true;
  } catch (error) {
    if (error.response) {
      console.error(`Failed to delete Zoom recording for meeting ${meetingId}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      
      const errorMessage = JSON.stringify(error.response.data);
      if (errorMessage.includes("scope") || errorMessage.includes("Invalid access token")) {
        console.error("⚠️  ACTION REQUIRED: Please add the 'cloud_recording:write:admin' scope to your Zoom App.");
      }
    } else {
      console.error(`Failed to delete Zoom recording for meeting ${meetingId}: ${error.message}`);
    }
    
    // Don't throw error - deletion failure shouldn't fail the entire process
    // The recording is safely in S3, just not deleted from Zoom
    return false;
  }
};

const downloadRecording = async (downloadUrl, fileName) => {
  const token = await getZoomAccessToken();
  const localPath = path.join(TEMP_DIR, fileName);

  console.log(`Downloading recording to: ${localPath}`);

  const response = await axios({
    method: "GET",
    url: downloadUrl,
    responseType: "stream",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 300000,
  });

  const writer = fs.createWriteStream(localPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log(`✓ Download complete: ${localPath}`);
      resolve(localPath);
    });
    writer.on("error", (err) => {
      console.error(`✗ Download failed: ${err.message}`);
      reject(err);
    });
  });
};

export const processRecording = async (bookingId, meetingId) => {
  console.log(`\n🎬 Processing recording for booking ${bookingId}, meeting ${meetingId}`);

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error(`✗ Booking not found: ${bookingId}`);
      return false;
    }

    if (booking.recording?.status === "ready") {
      console.log(`✓ Recording already processed for booking ${bookingId}`);
      return true;
    }

    if (booking.recording?.retryCount >= MAX_RETRY_ATTEMPTS) {
      console.log(`✗ Max retry attempts reached for booking ${bookingId}`);
      await booking.updateOne({
        "recording.status": "failed",
        "recording.error": "Max retry attempts exceeded",
        "recording.lastProcessedAt": new Date(),
      });
      return false;
    }

    await booking.updateOne({
      "recording.status": "processing",
      "recording.lastProcessedAt": new Date(),
      $inc: { "recording.retryCount": 1 },
    });

    console.log(`Fetching recording metadata from Zoom...`);
    const recordingData = await fetchZoomRecording(meetingId);

    if (!recordingData) {
      console.log(`Recording not available yet for meeting ${meetingId}`);
      await booking.updateOne({
        "recording.status": "pending",
        "recording.error": "Recording not available yet - will retry",
      });
      return false;
    }

    console.log(`Downloading recording from Zoom...`);
    const fileName = `${bookingId}_${meetingId}_${Date.now()}.mp4`;
    const localPath = await downloadRecording(recordingData.downloadUrl, fileName);

    console.log(`Uploading recording to S3...`);
    const { url, provider } = await uploadRecording(localPath, bookingId, meetingId);

    console.log(`Updating booking with recording URL...`);
    await booking.updateOne({
      recording: {
        provider: "platform",
        url,
        duration: recordingData.duration,
        status: "ready",
        uploadedAt: new Date(),
        zoomMetadata: {
          recordingId: recordingData.recordingId,
          recordingStart: recordingData.recordingStart,
          recordingEnd: recordingData.recordingEnd,
          fileSize: recordingData.fileSize,
          recordingType: recordingData.recordingType,
        },
        error: "",
        retryCount: booking.recording?.retryCount || 0,
        lastProcessedAt: new Date(),
      },
    });

    console.log(`✅ Recording processed successfully for booking ${bookingId}`);
    console.log(`   S3 URL: ${url}\n`);

    // Delete from Zoom cloud storage after successful upload to S3
    const deleted = await deleteZoomRecording(meetingId);
    if (deleted) {
      console.log(`✓ Zoom cloud recording deleted for meeting ${meetingId}`);
    } else {
      console.log(`⚠️  Warning: Failed to delete Zoom cloud recording for meeting ${meetingId} - it remains in Zoom storage`);
    }

    return true;
  } catch (error) {
    console.error(`✗ Failed to process recording for booking ${bookingId}:`, error.message);

    try {
      const booking = await Booking.findById(bookingId);
      await booking?.updateOne({
        "recording.status": "failed",
        "recording.error": error.message,
        "recording.lastProcessedAt": new Date(),
      });
    } catch (updateError) {
      console.error(`Failed to update booking error status:`, updateError.message);
    }

    return false;
  }
};

export const processRecordingByMeetingId = async (meetingId) => {
  console.log(`\n🔍 Finding booking for meeting ${meetingId}`);

  try {
    const booking = await Booking.findOne({
      $or: [
        { "meeting.meetingId": String(meetingId) },
        { meetingId: String(meetingId) },
      ],
    });

    if (!booking) {
      console.error(`✗ No booking found for meeting ${meetingId}`);
      return false;
    }

    console.log(`✓ Found booking: ${booking._id}`);
    return await processRecording(String(booking._id), meetingId);
  } catch (error) {
    console.error(`✗ Error processing recording for meeting ${meetingId}:`, error.message);
    return false;
  }
};

export const retryFailedRecordings = async () => {
  console.log(`\n🔄 Checking for recordings to retry...`);

  try {
    const bookings = await Booking.find({
      "recording.status": { $in: ["pending", "failed"] },
      "recording.retryCount": { $lt: MAX_RETRY_ATTEMPTS },
      "lesson.scheduledAt": { $lt: new Date(Date.now() - 10 * 60 * 1000) },
      $or: [
        { "recording.lastProcessedAt": { $exists: false } },
        { "recording.lastProcessedAt": { $lt: new Date(Date.now() - 10 * 60 * 1000) } },
      ],
    }).limit(10);

    console.log(`Found ${bookings.length} recordings to retry`);

    let successCount = 0;
    for (const booking of bookings) {
      const meetingId = booking.meeting?.meetingId || booking.meetingId;
      if (meetingId) {
        const success = await processRecording(String(booking._id), meetingId);
        if (success) successCount++;
      }
    }

    console.log(`✅ Retry completed: ${successCount}/${bookings.length} successful\n`);
    return successCount;
  } catch (error) {
    console.error(`✗ Error retrying recordings:`, error.message);
    return 0;
  }
};
