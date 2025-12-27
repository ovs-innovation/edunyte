import { z } from "zod";

/**
 * Validation schemas for Language operations
 */
export const createLanguageSchema = z.object({
  name: z.string().min(1, "Language name is required").trim(),
  code: z.string().min(2, "Language code must be at least 2 characters").max(5).trim(),
  nativeName: z.string().optional().default(""),
  flag: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateLanguageSchema = z.object({
  name: z.string().min(1).trim().optional(),
  code: z.string().min(2).max(5).trim().optional(),
  nativeName: z.string().optional(),
  flag: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

