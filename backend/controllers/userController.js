import User from "../models/userModel.js";
import { rolePermissions, roles } from "../lib/roles.js";
import Role from "../models/roleModel.js";
import { resolveRoleKey } from "../lib/validateRole.js";

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
    const perms = await resolvePermissions(user.role);
    res.status(201).json({ user: toUserDto(user, perms) });
  } catch (err) {
    next(err);
  }
};

