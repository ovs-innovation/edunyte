import mongoose from "mongoose";

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

categorySchema.pre("save", async function (next) {
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
    const baseSlug = generateSlug(nameValue);

    if (baseSlug) {
      let slugValue = baseSlug;
      let counter = 1;
      const Category = this.constructor;

      while (await Category.findOne({ 
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

categorySchema.index({ status: 1, createdAt: -1 });
categorySchema.index({ createdBy: 1 });
categorySchema.index({ "slug.en": 1 }, { unique: true, sparse: true });

export default mongoose.model("Category", categorySchema);

