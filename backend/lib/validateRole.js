import Role from "../models/roleModel.js";

export const resolveRoleKey = async (roleKey) => {
  if (!roleKey) return "super_admin";
  const key = roleKey.toLowerCase();
  const dbRole = await Role.findOne({ key });
  return dbRole ? dbRole.key : "super_admin";
};

