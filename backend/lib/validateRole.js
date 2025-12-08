import Role from "../models/roleModel.js";
import { roles } from "./roles.js";

export const resolveRoleKey = async (roleKey) => {
  if (!roleKey) return "super_admin";
  const key = roleKey.toLowerCase();
  const dbRole = await Role.findOne({ key });
  if (dbRole) return dbRole.key;
  if (roles.includes(key)) return key;
  return "super_admin";
};

