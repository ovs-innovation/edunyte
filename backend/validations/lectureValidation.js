import { z } from "zod";

const titleSchema = z.any().refine(
  (val) => {
    if (typeof val === "string") {
      return val.trim().length > 0;
    }
    if (typeof val === "object" && val !== null) {
      return Object.keys(val).length > 0 && typeof val.en === "string";
    }
    return false;
  },
  { message: "Title must be a non-empty string or language object with 'en' key" }
);

const descriptionSchema = z.any().refine(
  (val) => {
    if (val === undefined || val === null) return true;
    if (typeof val === "string") return true;
    if (typeof val === "object" && val !== null) {
      return Object.keys(val).length > 0;
    }
    return false;
  },
  { message: "Description must be a string or language object" }
).optional();

const liveMeetingSchema = z.object({
  provider: z.enum(["google_meet", "zoom", "teams", "custom"]).optional().default("google_meet"),
  meetingUrl: z.string().optional().default(""),
  meetingId: z.string().optional().default(""),
  scheduledAt: z.union([z.string(), z.date()]).optional().nullable(),
  duration: z.coerce.number().optional().default(60),
  status: z.enum(["scheduled", "live", "completed", "cancelled"]).optional().default("scheduled"),
}).optional();

export const createLectureSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  section: z.string().optional().default("General"),
  type: z.enum(["recorded", "live"]).optional().default("recorded"),
  videoUrl: z.string().optional().default(""),
  videoPublicId: z.string().optional().default(""),
  videoDuration: z.coerce.number().optional().default(0),
  liveMeeting: liveMeetingSchema,
  order: z.coerce.number().optional().default(0),
  isPreview: z.boolean().optional().default(false),
  status: z.enum(["active", "draft", "archived"]).optional().default("active"),
});

export const updateLectureSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema,
  section: z.string().optional(),
  type: z.enum(["recorded", "live"]).optional(),
  videoUrl: z.string().optional(),
  videoPublicId: z.string().optional(),
  videoDuration: z.coerce.number().optional(),
  liveMeeting: liveMeetingSchema,
  order: z.coerce.number().optional(),
  isPreview: z.boolean().optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
});
