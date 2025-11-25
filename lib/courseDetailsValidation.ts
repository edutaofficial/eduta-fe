/**
 * Course Details Validation Schema
 * Centralized validation rules using Zod
 */

import * as z from "zod";

export const courseDetailsValidationSchema = z.object({
  courseTitle: z
    .string()
    .min(1, "Course title is required")
    .max(100, "Course title must be less than 100 characters"),
  
  selectedCategory: z
    .string()
    .min(1, "Category is required"),
  
  learningLevel: z
    .string()
    .min(1, "Learning level is required"),
  
  description: z
    .string()
    .min(50, "Course description must be at least 50 characters")
    .max(6500, "Course description must be less than 6500 characters"),
  
  learningPoints: z
    .array(
      z.object({
        id: z.number(),
        text: z.string().max(120, "Learning point must be 120 characters or less"),
      })
    )
    .refine(
      (points) => {
        const filledPoints = points.filter((p) => p.text.trim().length > 0);
        return filledPoints.length >= 4;
      },
      {
        message: "At least 4 learning points are required",
      }
    )
    .refine(
      (points) => points.length <= 10,
      {
        message: "Maximum 10 learning points allowed",
      }
    ),
  
  promoVideoId: z.union([z.number(), z.null()]).nullable(),
  
  courseBannerId: z
    .union([z.number(), z.null()])
    .refine((val) => val !== null, {
      message: "Cover banner is required",
    }),
});

export type CourseDetailsValidationSchema = z.infer<typeof courseDetailsValidationSchema>;

