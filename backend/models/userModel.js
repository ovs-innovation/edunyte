import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Role from "../models/roleModel.js";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      lowercase: true,
      trim: true,
      default: "super_admin",
      validate: [
        {
          validator: async function (value) {
            if (!value) return false;
            const key = value.toLowerCase();
            const dbRole = await Role.findOne({ key });
            return Boolean(dbRole);
          },
          message: (props) => `${props.value} is not a valid role`,
        },
      ],
    },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
    googleId: { type: String },
    firebaseId: { type: String },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);

