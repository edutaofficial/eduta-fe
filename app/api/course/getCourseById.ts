import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";
import type { CourseDetailApiResponse } from "@/types/course";

// Re-export the type for backward compatibility
export type CourseByIdResponse = CourseDetailApiResponse;

/**
 * Fetch course by ID including currentStep information
 * This is used for editing draft/published courses
 */
export async function getCourseById(
  courseId: string
): Promise<CourseDetailApiResponse> {
  try {
    const { data } = await axiosInstance.get<CourseDetailApiResponse>(
      `/api/instructor/courses/${courseId}`
    );

    // eslint-disable-next-line no-console
    console.log("Get course by ID response:", data);

    return data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching course by ID:", error);
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    const errorWithOriginal = enhancedError as Error & {
      originalError?: unknown;
    };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}
