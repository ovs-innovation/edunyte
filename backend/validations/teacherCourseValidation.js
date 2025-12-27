import { z } from "zod";

/**
 * Validation schemas for TeacherCourse operations
 */
export const createTeacherCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  languageId: z.string().min(1, "Language ID is required"),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().optional().default("USD"),
  timezone: z.string().optional().default("UTC"),
});

export const updateTeacherCourseStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional().default(""),
});

