import Role from "../models/roleModel.js";
import { rolePermissions } from "../lib/roles.js";

export const requirePermission = (permission) => async (req, res, next) => {
  const roleKey = req.user?.role;
  if (!roleKey) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const role = await Role.findOne({ key: roleKey });
  const dbPerms = role?.permissions || [];
  const defaultPerms = rolePermissions[roleKey] || [];
  const perms = dbPerms.length > 0 ? dbPerms : defaultPerms;
  
  if (!perms.includes(permission)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

