import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
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

// Helper function to generate slug from text
const generateSlug = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
};

courseSchema.pre("save", async function (next) {
  if (typeof this.name === "string") {
    this.name = { en: this.name };
  }
  if (typeof this.description === "string") {
    this.description = { en: this.description };
  }

  // Auto-generate slug from course name if not provided or if name changed
  if (this.isNew || this.isModified("name")) {
    const { getLanguageValue } = await import("../utils/languageHelper.js");
    const nameValue = getLanguageValue(this.name);
    let baseSlug = generateSlug(nameValue);
    
    // Ensure slug is unique
    if (baseSlug) {
      let slug = baseSlug;
      let counter = 1;
      const Course = this.constructor;
      
      while (await Course.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this.slug = slug;
    }
  }

  next();
});

courseSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Course", courseSchema);

