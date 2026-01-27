import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

/**
 * Environment variables
 */
const {
  REDIS_HOST = "localhost",
  REDIS_PORT = 6379,
  REDIS_USERNAME = "default",
  REDIS_PASSWORD
} = process.env;

let client;

/**
 * Initialize Redis connection
 */
export async function initRedis() {
  if (client) return client;

  client = createClient({
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    socket: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT)
    }
  });

  client.on("ready", () => {
    console.log("Redis connected ✅");
  });

  client.on("error", (err) => {
    console.error("Redis error ❌:", err.message);
  });

  await client.connect();
  return client;
}

/**
 * Get active Redis client
 */
export function getRedisClient() {
  if (!client) {
    throw new Error("Redis not initialized. Call initRedis() first.");
  }
  return client;
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis() {
  if (client) {
    await client.quit();
    client = null;
    console.log("Redis connection closed");
  }
}
