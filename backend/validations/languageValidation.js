import { z } from "zod";

const nameSchema = z.any().refine(
  (val) => {
    if (typeof val === "string") {
      return val.trim().length > 0;
    }
    if (typeof val === "object" && val !== null) {
      return Object.keys(val).length > 0 && typeof val.en === "string";
    }
    return false;
  },
  { message: "Name must be a non-empty string or language object with 'en' key" }
);

const nativeNameSchema = z.any().refine(
  (val) => {
    if (val === undefined || val === null) return true;
    if (typeof val === "string") return true;
    if (typeof val === "object" && val !== null) {
      return Object.keys(val).length > 0;
    }
    return false;
  },
  { message: "Native name must be a string or language object" }
).optional();

export const createLanguageSchema = z.object({
  name: nameSchema,
  code: z.string().min(2, "Language code must be at least 2 characters").max(5).trim(),
  nativeName: nativeNameSchema,
  flag: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateLanguageSchema = z.object({
  name: nameSchema.optional(),
  code: z.string().min(2).max(5).trim().optional(),
  nativeName: nativeNameSchema,
  flag: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

