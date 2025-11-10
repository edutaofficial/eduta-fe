import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface PublishCourseRequest {
  isDraft: boolean;
  welcomeMessage?: string; // Optional for publish
  congratulationMessage?: string; // Optional for publish
}

export async function publishCourse(
  courseId: string,
  data: PublishCourseRequest
): Promise<void> {
  try {
    await axiosInstance.put(`/api/instructor/courses/${courseId}/publish`, data);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error publishing course:", error);
    // Extract and throw user-friendly error message
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    // Preserve original error for debugging
    const errorWithOriginal = enhancedError as Error & { originalError?: unknown };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}


