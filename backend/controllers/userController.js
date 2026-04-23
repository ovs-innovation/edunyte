import User from "../models/userModel.js";
import { rolePermissions } from "../lib/roles.js";
import Role from "../models/roleModel.js";
import { resolveRoleKey } from "../lib/validateRole.js";
import StudentProfile from "../models/studentProfileModel.js";
import TeacherProfile from "../models/teacherProfileModel.js";
import Availability from "../models/availabilityModel.js";
import TeacherCourse from "../models/teacherCourseModel.js";
import { sendInstructorApprovalEmail } from "../utils/emailService.js";

const resolvePermissions = async (roleKey) => {
  const role = await Role.findOne({ key: roleKey });
  if (role) return role.permissions || [];
  return rolePermissions[roleKey] || [];
};

const toUserDto = (user, perms) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: perms,
  status: user.status,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const mapped = await Promise.all(
      users.map(async (u) => toUserDto(u, await resolvePermissions(u.role)))
    );
    res.json({ users: mapped });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const userRole = await resolveRoleKey(role);
    const userStatus = ["active", "inactive", "pending"].includes(status) ? status : "active";
    const user = await User.create({ name, email, password, role: userRole, status: userStatus });

    if (user.role === "student") {
      await StudentProfile.create({ userId: user._id });
    } else if (user.role === "teacher") {
      await TeacherProfile.create({ userId: user._id });
    }

    const perms = await resolvePermissions(user.role);
    res.status(201).json({ user: toUserDto(user, perms) });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email already registered" });
      user.email = email;
    }
    if (name) user.name = name;
    if (password) user.password = password;
    if (role) user.role = await resolveRoleKey(role);
    
    const oldStatus = user.status;
    if (status && ["active", "inactive", "pending"].includes(status)) user.status = status;
    await user.save();

    // Send approval email if teacher is activated
    if (user.role === "teacher" && oldStatus === "pending" && user.status === "active") {
      await sendInstructorApprovalEmail(user.email, user.name);
    }

    if (user.role === "student") {
      const existing = await StudentProfile.findOne({ userId: user._id });
      if (!existing) await StudentProfile.create({ userId: user._id });
    } else if (user.role === "teacher") {
      const existing = await TeacherProfile.findOne({ userId: user._id });
      if (!existing) await TeacherProfile.create({ userId: user._id });
    }

    const perms = await resolvePermissions(user.role);
    res.json({ user: toUserDto(user, perms) });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "student") {
      await StudentProfile.findOneAndDelete({ userId: user._id });
    } else if (user.role === "teacher") {
      await TeacherProfile.findOneAndDelete({ userId: user._id });
      await Availability.deleteMany({ teacherId: user._id });
      await TeacherCourse.deleteMany({ teacherId: user._id });
    }

    await user.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

