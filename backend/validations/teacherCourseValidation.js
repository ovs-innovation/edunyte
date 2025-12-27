import { z } from "zod";

/**
 * Validation schemas for TeacherCourse operations
 */
export const createTeacherCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  languageIds: z.array(z.string().min(1, "Language ID is required")).min(1, "At least one language is required"),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().optional().default("USD"),
  timezone: z.string().optional().default("UTC"),
  introductionVideo: z.string().url("Invalid video URL").optional().or(z.literal("")),
  experience: z.string().optional().default(""),
  bio: z.string().optional().default(""),
});

export const updateTeacherCourseStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional().default(""),
});

