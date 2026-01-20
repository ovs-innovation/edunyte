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

const imageSchema = z.union([
  z.string().url("Invalid image URL"),
  z.literal("")
]).optional();

export const createCategorySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  image: imageSchema,
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateCategorySchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  image: imageSchema,
  status: z.enum(["active", "inactive"]).optional(),
});

