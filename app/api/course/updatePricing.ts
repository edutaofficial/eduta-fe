import axiosInstance from "@/app/api/axiosInstance";
import type { PricingRequest } from "@/types/course";
import { extractErrorMessage } from "@/lib/utils/errorUtils";

export async function updatePricing(courseId: string, payload: PricingRequest): Promise<void> {
  try {
    await axiosInstance.put(`/api/instructor/courses/${courseId}/pricing`, payload);
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error updating pricing:", error);
    // Extract and throw user-friendly error message
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    // Preserve original error for debugging
    const errorWithOriginal = enhancedError as Error & { originalError?: unknown };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}


