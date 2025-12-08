import { rolePermissions } from "../lib/roles.js";

export const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !rolePermissions[role]?.includes(permission)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

