import axiosInstance from "@/app/api/axiosInstance";
import type { CurriculumRequest } from "@/types/course";
import { extractErrorMessage } from "@/lib/errorUtils";

export async function updateCurriculum(courseId: string, payload: CurriculumRequest): Promise<void> {
  try {
    await axiosInstance.put(`/api/instructor/courses/${courseId}/curriculum`, payload);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error updating curriculum:", error);
    // Extract and throw user-friendly error message
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    // Preserve original error for debugging
    const errorWithOriginal = enhancedError as Error & { originalError?: unknown };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}


