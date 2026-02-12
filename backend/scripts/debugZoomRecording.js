import mongoose from "mongoose";
import dotenv from "dotenv";
import { processRecordingByMeetingId } from "../services/recordingService.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Booking from "../models/bookingModel.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "../.env");
const logPath = path.join(__dirname, "debug_log.txt");

// Setup logging BEFORE anything else runs
const originalLog = console.log;
const originalError = console.error;

const logToFile = (msg) => {
  try {
    fs.appendFileSync(logPath, msg + "\n", "utf8");
  } catch (e) {
    // Ignore logging errors to avoid recursion
  }
};

console.log = (...args) => {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  originalLog(msg);
  logToFile(msg);
};

console.error = (...args) => {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  originalError(msg);
  logToFile("ERROR: " + msg);
};


if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error("Error: .env file not found at " + envPath);
  process.exit(1);
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed: " + error.message);
    process.exit(1);
  }
};

const run = async () => {
  // Clear previous log
  fs.writeFileSync(logPath, "", "utf8");
  console.log("--- Debug Session Start ---");
  
  const meetingId = process.argv[2];
  
  if (!meetingId) {
    console.log("No meeting ID provided. finding recent pending recordings...");
    await connectDB();
    
    try {
      const bookings = await Booking.find({
        "recording.status": { $ne: "ready" },
        "meeting.meetingId": { $exists: true }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("meeting.meetingId recording.status lesson.scheduledAt");

      if (bookings.length > 0) {
        console.log("Recent bookings with pending recordings:");
        bookings.forEach(b => {
          console.log(`- Meeting ID: ${b.meeting?.meetingId || "N/A"} | Status: ${b.recording?.status || "pending"} | Date: ${b.lesson?.scheduledAt}`);
        });
        console.log("\nTo process one of these, run:");
        console.log("node scripts/debugZoomRecording.js <meeting_id>");
      } else {
        console.log("No pending recordings found in the last 5 bookings.");
      }
    } catch (err) {
      console.error("Error finding bookings: " + err.message);
    } finally {
      await mongoose.connection.close();
      process.exit(0);
    }
    return;
  }

  console.log(`Debugging recording process for meeting ID: ${meetingId}`);
  
  await connectDB();

  try {
    const success = await processRecordingByMeetingId(meetingId);
    
    if (success) {
      console.log("SUCCESS: Recording processed and uploaded.");
    } else {
      console.log("FAILURE: Recording processing failed or not ready.");
    }
  } catch (error) {
    console.error("CRITICAL ERROR: " + error.message);
    if (error.stack) console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
