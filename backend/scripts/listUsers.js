import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({}, "name email role");
    console.log("Users in database:");
    console.table(users.map(u => ({ name: u.name, email: u.email, role: u.role })));

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

listUsers();
