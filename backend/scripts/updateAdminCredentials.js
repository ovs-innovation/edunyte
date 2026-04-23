import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const updateAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // const oldEmail = "angadkumar70676@gmail.com";
    const newEmail = "ovsinnovation369@gmail.com";
    const newPasswordHash = "$2a$12$pInSOEVChiMWUPC8oB.NLuqVKtb4gRQwgJ8K9seGkHHVMc5IIk9oW";

    // 1. Check if the old admin exists
    const user = await User.findOne({ email: newEmail });

    if (user) {
      console.log(`Found user ${oldEmail}. Updating to ${newEmail}...`);
      
      // Update fields
      user.email = newEmail;
      // Assign hash directly. Note: save() will trigger pre-save hook which re-hashes.
      // So we use updateOne to set the hash directly.
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            email: newEmail, 
            password: newPasswordHash,
            role: "admin",
            status: "active" 
          } 
        }
      );
      console.log("Update successful.");
    } else {
      console.log(`User ${oldEmail} not found.`);
      
      // 2. Check if the new email already exists
      const existingNewUser = await User.findOne({ email: newEmail });
      if (existingNewUser) {
        console.log(`User ${newEmail} already exists. Updating password hash...`);
        await User.updateOne(
          { _id: existingNewUser._id },
          { $set: { password: newPasswordHash, role: "admin", status: "active" } }
        );
        console.log("Update successful.");
      } else {
        console.log(`Creating new super_admin with email ${newEmail}...`);
        // We use insertMany or findOneAndUpdate with upsert to bypass the re-hashing logic 
        // OR we just create it and then update the password to the hash.
        const newUser = await User.create({
          name: "Admin",
          email: newEmail,
          password: "temporary_password", // will be hashed by pre-save
          role: "admin",
          status: "active"
        });
        
        // Now overwrite with the specific hash
        await User.updateOne(
          { _id: newUser._id },
          { $set: { password: newPasswordHash } }
        );
        console.log("Creation and hash update successful.");
      }
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error during update:", error);
    process.exit(1);
  }
};

updateAdmin();
