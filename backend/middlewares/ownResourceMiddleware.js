import { requirePermission } from "./permissionMiddleware.js";

export const requireOwnOrPermission = (permission) => async (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  const requestingUserId = req.user?.id;

  if (!userId || !requestingUserId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (userId === requestingUserId || userId === "me") {
    return next();
  }

  return requirePermission(permission)(req, res, next);
};

