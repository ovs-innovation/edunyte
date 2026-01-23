import { z } from "zod";

const languageTextSchema = z.any().refine(
  (val) => {
    if (val === undefined || val === null || val === "") return true;
    if (typeof val === "string") return true;
    if (typeof val === "object" && val !== null) {
      return Object.keys(val).length > 0;
    }
    return false;
  },
  { message: "Must be a string or language object" }
).optional();

export const createTeacherCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  languageIds: z.array(z.string().min(1, "Language ID is required")).min(1, "At least one language is required"),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().optional().default("INR"),
  timezone: z.string().optional().default("UTC"),
  introductionVideo: z.union([
    z.string().url("Invalid video URL"),
    z.literal("")
  ]).optional(),
  experience: languageTextSchema,
  bio: languageTextSchema,
  aboutCourse: languageTextSchema,
});

export const updateTeacherCourseStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional().default(""),
});

