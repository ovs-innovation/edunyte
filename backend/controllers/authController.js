import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { rolePermissions } from "../lib/roles.js";
import Role from "../models/roleModel.js";
import { resolveRoleKey } from "../lib/validateRole.js";

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
    const perms = await resolvePermissions(user.role);
    const token = generateToken(user);
    res.json({ token, user: formatUser(user, perms) });
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
    res.json({ user: formatUser(user, perms) });
  } catch (err) {
    next(err);
  }
};

