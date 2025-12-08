import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { rolePermissions, roles } from "../lib/roles.js";

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: rolePermissions[user.role] || [],
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
    const userRole = roles.includes(role) ? role : "admin";
    const user = await User.create({ name, email, password, role: userRole });
    const token = generateToken(user);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
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
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user);
    res.json({ token, user: formatUser(user) });
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
    res.json({ user: formatUser(user) });
  } catch (err) {
    next(err);
  }
};

