/**
 * Course Details Validation Schema
 * Centralized validation rules using Zod
 */

import * as z from "zod";
import { countWords } from "./textUtils";

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
  
  shortDescription: z
    .string()
    .max(500, "Short description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  fullDescription: z
    .string()
    .refine(
      (val) => {
        const words = countWords(val);
        return words >= 1000;
      },
      {
        message: "Course description must be at least 1,000 words",
      }
    )
    .refine(
      (val) => {
        const words = countWords(val);
        return words <= 3000;
      },
      {
        message: "Course description must not exceed 3,000 words",
      }
    ),
  
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
  
  requirements: z
    .array(
      z.object({
        id: z.number(),
        text: z.string().max(120, "Requirement must be 120 characters or less"),
      })
    )
    .refine(
      (points) => {
        const filledPoints = points.filter((p) => p.text.trim().length > 0);
        return filledPoints.length >= 2;
      },
      {
        message: "At least 2 requirements are required",
      }
    )
    .refine(
      (points) => points.length <= 10,
      {
        message: "Maximum 10 requirements allowed",
      }
    ),
  
  whoThisCourseIsFor: z
    .array(
      z.object({
        id: z.number(),
        text: z.string().max(120, "Point must be 120 characters or less"),
      })
    )
    .refine(
      (points) => {
        const filledPoints = points.filter((p) => p.text.trim().length > 0);
        return filledPoints.length >= 2;
      },
      {
        message: "At least 2 points are required for who this course is for",
      }
    )
    .refine(
      (points) => points.length <= 10,
      {
        message: "Maximum 10 points allowed",
      }
    ),
  
  certificateDescription: z
    .string()
    .max(500, "Certificate description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  promoVideoId: z.union([z.number(), z.null()]).nullable(),
  
  courseBannerId: z
    .union([z.number(), z.null()])
    .refine((val) => val !== null, {
      message: "Cover banner is required",
    }),
});

export type CourseDetailsValidationSchema = z.infer<typeof courseDetailsValidationSchema>;

