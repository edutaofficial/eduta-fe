import axiosInstance from "@/app/api/axiosInstance";
import type { CreateCourseRequest } from "@/types/course";
import { extractErrorMessage } from "@/lib/utils/errorUtils";

export interface CreateCourseResponse {
  id: string; // courseId
}

export async function createCourse(payload: CreateCourseRequest): Promise<CreateCourseResponse> {
  try {
    const { data } = await axiosInstance.post<{
      success: boolean;
      message: string;
      data?: {
        courseId?: string;
        id?: string;
        [key: string]: unknown;
      };
      id?: string;
      courseId?: string;
    }>("/api/instructor/courses", payload);
    
    // eslint-disable-next-line no-console
    console.log("Create course API response:", data);
    
    // Handle nested response structure: response.data.data.courseId
    const courseId = data?.data?.courseId || data?.data?.id || data?.courseId || data?.id;
    
    if (!courseId) {
      // eslint-disable-next-line no-console
      console.error("Course ID not found in response:", data);
      throw new Error("Course ID not found in API response");
    }
    
    return { id: String(courseId) };
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error creating course:", error);
    // Extract and throw user-friendly error message
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    // Preserve original error for debugging
    const errorWithOriginal = enhancedError as Error & { originalError?: unknown };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}


