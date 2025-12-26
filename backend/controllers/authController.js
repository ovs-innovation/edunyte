import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import Settings from "../models/settingsModel.js";
import { generateToken } from "../utils/generateToken.js";
import { rolePermissions } from "../lib/roles.js";
import Role from "../models/roleModel.js";
import { resolveRoleKey } from "../lib/validateRole.js";
import { sendOTPEmail, sendResetPasswordEmail } from "../utils/emailService.js";
import TeacherProfile from "../models/teacherProfileModel.js";
import crypto from "crypto";

const resolvePermissions = async (roleKey) => {
  const role = await Role.findOne({ key: roleKey });
  if (role) return role.permissions || [];
  return rolePermissions[roleKey] || [];
};

const formatUser = (user, perms) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: perms,
  status: user.status,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const userRole = await resolveRoleKey(role || "super_admin");
    const user = await User.create({ name, email, password, role: userRole });
    const perms = await resolvePermissions(user.role);
    const token = generateToken(user);
    res.status(201).json({ token, user: formatUser(user, perms) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, otp } = req.body;
    const { appType } = req.query;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    if (appType === "admin" && user.role === "student") {
      return res.status(403).json({ 
        message: "Students cannot login to admin panel. Please use the student app." 
      });
    }
    
    if (appType === "student" && ["super_admin", "admin", "teacher"].includes(user.role)) {
      return res.status(403).json({ 
        message: "Please use the admin panel to login." 
      });
    }
    
    if (user.status === "inactive" || user.status === "pending") {
      return res.status(403).json({ message: "Account is not active" });
    }
    const settings = await Settings.getSettings();
    if (settings.twoFactorAuth) {
      if (!otp) {
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await OTP.deleteMany({ email, purpose: "login" });
        await OTP.create({ email, otp: otpCode, purpose: "login", expiresAt });
        await sendOTPEmail(email, otpCode, user.name);
        return res.json({ requiresOTP: true, message: "OTP sent to your email" });
      }
      const otpRecord = await OTP.findOne({ email, otp, purpose: "login" });
      if (!otpRecord) {
        return res.status(401).json({ message: "Invalid OTP. Please check your email and try again." });
      }
      if (otpRecord.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(401).json({ message: "OTP has expired. Please request a new one." });
      }
      await OTP.deleteOne({ _id: otpRecord._id });
    }
    user.lastLogin = new Date();
    await user.save();
    const perms = await resolvePermissions(user.role);
    const token = generateToken(user);
    res.json({ token, user: formatUser(user, perms) });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "If that account exists, a code has been sent" });
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.deleteMany({ email, purpose: "reset" });
    await OTP.create({ email, otp: otpCode, purpose: "reset", expiresAt });
    await sendResetPasswordEmail(email, otpCode, user.name);
    res.json({ message: "Password reset code sent to your email" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, code, and new password are required" });
    }
    const otpRecord = await OTP.findOne({ email, otp, purpose: "reset" });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      if (otpRecord) await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(401).json({ message: "Invalid or expired code" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = password;
    await user.save();
    await OTP.deleteMany({ email, purpose: "reset" });
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const perms = await resolvePermissions(user.role);
    const userData = formatUser(user, perms);
    
    if (user.role === "teacher") {
      let teacherProfile = await TeacherProfile.findOne({ userId: user._id });
      if (!teacherProfile) {
        teacherProfile = await TeacherProfile.create({ userId: user._id });
      }
      userData.profile = teacherProfile;
    }
    
    res.json({ user: userData });
  } catch (err) {
    next(err);
  }
};
