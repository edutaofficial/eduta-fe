import axiosInstance from "@/app/api/axiosInstance";
import type { CreateCourseRequest } from "@/types/course";
import { extractErrorMessage } from "@/lib/errorUtils";

export async function updateCourseDetails(
  courseId: string,
  payload: CreateCourseRequest
): Promise<void> {
  try {
    await axiosInstance.put(
      `/api/instructor/courses/${courseId}/details`,
      payload
    );
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error updating course details:", error);
    // Extract and throw user-friendly error message
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    // Preserve original error for debugging
    const errorWithOriginal = enhancedError as Error & { originalError?: unknown };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}

