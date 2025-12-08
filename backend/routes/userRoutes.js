import express from "express";
import { createUser, listUsers } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requirePermission("users.view"), listUsers);
router.post("/", verifyToken, requirePermission("users.create"), createUser);

export default router;

