import { z } from "zod";

/**
 * Validation schemas for Course operations
 */
export const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").trim(),
  description: z.string().optional().default(""),
  category: z.string().optional().default(""),
  image: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateCourseSchema = z.object({
  name: z.string().min(1).trim().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

