import mongoose from "mongoose";
import dns from "dns";

// Set DNS servers to resolve MongoDB SRV records reliably on Windows/local networks
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully ✅");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;

