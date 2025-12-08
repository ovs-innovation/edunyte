import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);

