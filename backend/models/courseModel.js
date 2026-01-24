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
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
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

const generateSlug = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") 
    .replace(/[^\w\-]+/g, "") 
    .replace(/\-\-+/g, "-") 
    .replace(/^-+/, "") 
    .replace(/-+$/, ""); 
};

courseSchema.pre("save", async function (next) {
  if (typeof this.name === "string") {
    this.name = { en: this.name };
  }
  if (typeof this.description === "string") {
    this.description = { en: this.description };
  }

  if (typeof this.slug === "string") {
    this.slug = { en: this.slug };
  }

  if (this.isNew || this.isModified("name")) {
    const { getLanguageValue } = await import("../utils/languageHelper.js");
    const nameValue = getLanguageValue(this.name);
    const currentSlugValue = getLanguageValue(this.slug);
    const baseSlug = generateSlug(nameValue);
    
    if (baseSlug) {
      let slugValue = baseSlug;
      let counter = 1;
      const Course = this.constructor;
      
      while (await Course.findOne({ 
        "slug.en": slugValue, 
        _id: { $ne: this._id } 
      })) {
        slugValue = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this.slug = { en: slugValue };
    }
  }

  next();
});

courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ "slug.en": 1 }, { unique: true, sparse: true });

export default mongoose.model("Course", courseSchema);

