import cron from "node-cron";
import { retryFailedRecordings } from "../services/recordingService.js";

let cronJob = null;

export const startRecordingCron = () => {
  if (cronJob) {
    console.log("⚠️  Recording cron job already running");
    return;
  }

  cronJob = cron.schedule("*/10 * * * *", async () => {
    console.log("\n⏰ [CRON] Recording retry job triggered");
    console.log(`   Time: ${new Date().toISOString()}`);

    try {
      const processedCount = await retryFailedRecordings();
      console.log(`✅ [CRON] Processed ${processedCount} recordings\n`);
    } catch (error) {
      console.error(`✗ [CRON] Error:`, error.message);
    }
  });

  console.log("✅ Recording cron job started (runs every 10 minutes)");
};

export const stopRecordingCron = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log("Recording cron job stopped");
  }
};

export const isRecordingCronRunning = () => {
  return cronJob !== null;
};
