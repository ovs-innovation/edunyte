import express from "express";
import {
  createLanguage,
  getLanguages,
  getLanguageById,
  updateLanguage,
  deleteLanguage,
} from "../../controllers/languageController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createLanguageSchema, updateLanguageSchema } from "../../validations/languageValidation.js";

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken);

// Create language (Admin only)
router.post(
  "/",
  requirePermission("languages.create"),
  validateRequest(createLanguageSchema),
  createLanguage
);

// Get all languages (Admin)
router.get("/", requirePermission("languages.view"), getLanguages);

// Get single language (Admin)
router.get("/:id", requirePermission("languages.view"), getLanguageById);

// Update language (Admin only)
router.patch(
  "/:id",
  requirePermission("languages.edit"),
  validateRequest(updateLanguageSchema),
  updateLanguage
);

// Delete language (Admin only)
router.delete("/:id", requirePermission("languages.delete"), deleteLanguage);

export default router;


