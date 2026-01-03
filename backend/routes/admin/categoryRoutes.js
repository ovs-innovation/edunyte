import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/categoryController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCategorySchema, updateCategorySchema } from "../../validations/categoryValidation.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all categories
router.get("/", requirePermission("categories.view"), getCategories);

// Get single category
router.get("/:id", requirePermission("categories.view"), getCategory);

// Create category
router.post(
  "/",
  requirePermission("categories.create"),
  validateRequest(createCategorySchema),
  createCategory
);

// Update category
router.patch(
  "/:id",
  requirePermission("categories.edit"),
  validateRequest(updateCategorySchema),
  updateCategory
);

// Delete category
router.delete("/:id", requirePermission("categories.delete"), deleteCategory);

export default router;

