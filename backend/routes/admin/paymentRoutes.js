import express from "express";
import { getAllPayments, getPaymentById, updatePayoutStatus } from "../../controllers/admin/paymentController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, requirePermission("users.view"), getAllPayments);
router.get("/:id", verifyToken, requirePermission("users.view"), getPaymentById);
router.patch("/:id/payout", verifyToken, requirePermission("users.edit"), updatePayoutStatus);

export default router;
