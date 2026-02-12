import express from "express";
import { getDashboardStats } from "../../controllers/admin/dashboardController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/stats", verifyToken, requirePermission("dashboard.view"), getDashboardStats);

export default router;
