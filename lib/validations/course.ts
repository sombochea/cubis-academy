import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  desc: z.string().optional(),
  category: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  duration: z.number().int().positive().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  youtubeUrl: z.url().optional().or(z.literal("")),
  zoomUrl: z.url().optional().or(z.literal("")),
});

export const enrollmentSchema = z.object({
  courseId: z.uuid("Invalid course ID"),
});

export const scoreSchema = z.object({
  enrollmentId: z.uuid("Invalid enrollment ID"),
  title: z.string().min(1, "Title is required"),
  score: z.number().min(0).max(100),
  maxScore: z.number().min(1).default(100),
  remarks: z.string().optional(),
});

export const attendanceSchema = z.object({
  enrollmentId: z.uuid("Invalid enrollment ID"),
  date: z.string(),
  status: z.enum(["present", "absent", "late"]),
  notes: z.string().optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type ScoreInput = z.infer<typeof scoreSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
