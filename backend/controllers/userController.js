import User from "../models/userModel.js";
import { rolePermissions, roles } from "../lib/roles.js";

const toUserDto = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: rolePermissions[user.role] || [],
  status: user.status,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(toUserDto) });
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
    const userRole = roles.includes(role) ? role : "admin";
    const userStatus = ["active", "inactive", "pending"].includes(status) ? status : "active";
    const user = await User.create({ name, email, password, role: userRole, status: userStatus });
    res.status(201).json({ user: toUserDto(user) });
  } catch (err) {
    next(err);
  }
};

