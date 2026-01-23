import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: { en: "" },
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    nativeName: {
      type: mongoose.Schema.Types.Mixed,
      default: { en: "" },
    },
    flag: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

languageSchema.pre("save", function (next) {
  if (typeof this.name === "string") {
    this.name = { en: this.name };
  }
  if (typeof this.nativeName === "string") {
    this.nativeName = { en: this.nativeName };
  }
  next();
});

languageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Language", languageSchema);

