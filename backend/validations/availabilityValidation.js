import { z } from "zod";

/**
 * Validation schemas for Availability operations
 */
export const createAvailabilitySchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  date: z.string().or(z.date()),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  duration: z.number().min(15).max(120),
  timezone: z.string().optional().default("UTC"),
  isRecurring: z.boolean().optional().default(false),
  recurringPattern: z.enum(["daily", "weekly", "monthly"]).optional().nullable(),
  recurringEndDate: z.string().or(z.date()).optional().nullable(),
});

export const bulkCreateAvailabilitySchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  slots: z.array(z.object({
    date: z.string().or(z.date()),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
    duration: z.number().min(15).max(120),
    timezone: z.string().optional().default("UTC"),
  })).min(1, "At least one slot is required"),
});

export const updateAvailabilitySchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(15).max(120).optional(),
  status: z.enum(["available", "booked", "blocked", "cancelled"]).optional(),
  timezone: z.string().optional(),
});

