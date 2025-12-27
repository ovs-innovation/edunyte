import Role from "../models/roleModel.js";
import { permissions, rolePermissions } from "../lib/roles.js";

const toDto = (role) => ({
  id: role._id.toString(),
  name: role.name,
  key: role.key,
  permissions: role.permissions || [],
  createdAt: role.createdAt,
});

const sanitizePermissions = (perms = []) => perms.filter((p) => permissions.includes(p));

export const listRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json({ roles: roles.map(toDto), permissions });
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { name, key, permissions: perms = [] } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const roleKey = (key || name).toLowerCase().replace(/\s+/g, "_");
    const exists = await Role.findOne({ key: roleKey });
    if (exists) {
      return res.status(409).json({ message: "Role already exists" });
    }
    const role = await Role.create({
      name,
      key: roleKey,
      permissions: sanitizePermissions(perms),
    });
    res.status(201).json({ role: toDto(role) });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, permissions: perms } = req.body;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    if (name) role.name = name;
    if (Array.isArray(perms)) {
      role.permissions = sanitizePermissions(perms);
    }
    await role.save();
    res.json({ role: toDto(role) });
  } catch (err) {
    next(err);
  }
};

export const ensureDefaultRoles = async () => {
  const defaults = Object.keys(rolePermissions);
  for (const key of defaults) {
    const exists = await Role.findOne({ key });
    if (!exists) {
      await Role.create({
        name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        key,
        permissions: rolePermissions[key],
      });
    } else {
      const latestPermissions = rolePermissions[key] || [];
      exists.permissions = sanitizePermissions(latestPermissions);
      await exists.save();
    }
  }
};
