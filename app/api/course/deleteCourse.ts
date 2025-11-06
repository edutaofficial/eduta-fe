import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/utils/errorUtils";

/**
 * Delete a course by ID
 */
export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await axiosInstance.delete(`/api/instructor/courses/${courseId}`);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error deleting course:", error);
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    const errorWithOriginal = enhancedError as Error & {
      originalError?: unknown;
    };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}


