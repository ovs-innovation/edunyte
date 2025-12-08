import express from "express";
import { createUser, deleteUser, listUsers, updateUser } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { requirePermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requirePermission("users.view"), listUsers);
router.post("/", verifyToken, requirePermission("users.create"), createUser);
router.patch("/:id", verifyToken, requirePermission("users.edit"), updateUser);
router.delete("/:id", verifyToken, requirePermission("users.delete"), deleteUser);

export default router;

