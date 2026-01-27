import http from "http";
import app from "./app.js";
import { initRedis } from "./config/redis.js";
import { startExchangeRateJob } from "./jobs/exchangeRateJob.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Redis and start cron job
const initializeServices = async () => {
  try {
    await initRedis();
    startExchangeRateJob();
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};

server.listen(PORT, async () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  await initializeServices();
});
