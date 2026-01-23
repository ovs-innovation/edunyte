import mongoose from "mongoose";

/**
 * Category Model
 * Stores course categories with images
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: { en: "" },
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
    },
    image: {
      type: String,
      trim: true,
      default: "",
      // Image URL (Cloudinary URL)
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (typeof this.name === "string") {
    this.name = { en: this.name };
  }
  if (typeof this.description === "string") {
    this.description = { en: this.description };
  }
  next();
});

categorySchema.index({ status: 1, createdAt: -1 });
categorySchema.index({ createdBy: 1 });

export default mongoose.model("Category", categorySchema);

