import http from "http";
import app from "./app.js";
import { initRedis } from "./config/redis.js";
import { startExchangeRateJob } from "./jobs/exchangeRateJob.js";
import { validateRazorpayConfig } from "./config/razorpay.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize services and startup validations
const initializeServices = async () => {
  try {
    // Validate Razorpay environment configuration at startup
    validateRazorpayConfig();

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
