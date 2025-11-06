import axiosInstance from "@/app/api/axiosInstance";
import type { Category } from "@/types/course";
import { extractErrorMessage } from "@/lib/utils/errorUtils";

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await axiosInstance.get<Category[]>("/api/instructor/categories");
    // eslint-disable-next-line no-console
    console.log("Categories:", data);
    return data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching categories:", error);
    // Extract and throw user-friendly error message
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage) as Error & { originalError?: unknown };
    // Preserve original error for debugging
    enhancedError.originalError = error;
    throw enhancedError;
  }
}


