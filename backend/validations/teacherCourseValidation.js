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
  languageIds: z.array(z.string().min(1, "Language ID is required")).min(1, "At least one language is required").optional(),
  languageCodes: z.array(z.string().min(1, "Language code is required")).min(1, "At least one language is required").optional(),
  languages: z.array(z.object({
    code: z.string().min(1, "Language code is required"),
    proficiency: z.enum(["native", "c2", "c1", "b2", "b1", "a2", "a1"]).optional().default("native"),
  })).min(1, "At least one language is required").optional(),
  // New pricing fields (teacher input)
  teacherPrice: z.number().min(0, "Teacher price must be non-negative").optional(),
  teacherCurrency: z.string().optional(),
  // Legacy fields (backward compatibility with older UI clients)
  price: z.number().min(0, "Price must be non-negative").optional(),
  currency: z.string().optional(),
  timezone: z.string().optional().default("UTC"),
  introductionVideo: z.union([
    z.string().url("Invalid video URL"),
    z.literal("")
  ]).optional(),
  experience: languageTextSchema,
  bio: languageTextSchema,
  aboutCourse: languageTextSchema,
}).refine((data) => {
  if (Array.isArray(data.languages) && data.languages.length > 0) return true;
  if (Array.isArray(data.languageIds) && data.languageIds.length > 0) return true;
  if (Array.isArray(data.languageCodes) && data.languageCodes.length > 0) return true;
  return false;
}, {
  message: "At least one language is required",
  path: ["languageIds"],
}).refine((data) => {
  // Require teacher pricing input (new) or legacy pricing input
  const hasNew = typeof data.teacherPrice === "number" && !!data.teacherCurrency;
  const hasLegacy = typeof data.price === "number" && !!data.currency;
  return hasNew || hasLegacy;
}, {
  message: "Teacher pricing is required",
  path: ["teacherPrice"],
});

export const updateTeacherCourseSchema = z.object({
  languageIds: z.array(z.string().min(1, "Language ID is required")).min(1, "At least one language is required").optional(),
  languageCodes: z.array(z.string().min(1, "Language code is required")).min(1, "At least one language is required").optional(),
  languages: z.array(z.object({
    code: z.string().min(1, "Language code is required"),
    proficiency: z.enum(["native", "c2", "c1", "b2", "b1", "a2", "a1"]).optional().default("native"),
  })).min(1, "At least one language is required").optional(),
  teacherPrice: z.number().min(0, "Teacher price must be non-negative").optional(),
  teacherCurrency: z.string().optional(),
  // Legacy fields (backward compatibility)
  price: z.number().min(0, "Price must be non-negative").optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
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

