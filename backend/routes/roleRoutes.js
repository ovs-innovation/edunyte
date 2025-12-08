import express from "express";
import { createRole, listRoles, updateRole } from "../controllers/roleController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requirePermission("roles.view"), listRoles);
router.post("/", verifyToken, requirePermission("roles.manage"), createRole);
router.patch("/:id", verifyToken, requirePermission("roles.manage"), updateRole);

export default router;

