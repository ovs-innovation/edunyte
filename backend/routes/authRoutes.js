import express from "express";
import { login, me, register, forgotPassword, resetPassword } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);
router.get("/me", verifyToken, me);

export default router;

