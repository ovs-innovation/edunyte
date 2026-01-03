import { z } from "zod";

/**
 * Validation schemas for Category operations
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
  description: z.string().optional().default(""),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim().optional(),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

