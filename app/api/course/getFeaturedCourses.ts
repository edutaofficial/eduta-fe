import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";
import type { PublicCourse } from "./searchCourses";

interface FeaturedCoursesParams {
  limit?: number; // max 50, min 1, default 10
}

interface FeaturedCoursesResponse {
  success: boolean;
  message: string;
  data: PublicCourse[];
}

export async function getFeaturedCourses(
  params: FeaturedCoursesParams = {}
): Promise<FeaturedCoursesResponse> {
  try {
    const { limit = 10 } = params;

    const { data } = await axiosInstance.get<FeaturedCoursesResponse>(
      "/api/v1/courses/featured",
      {
        params: {
          limit: Math.min(Math.max(limit, 1), 50), // Ensure between 1 and 50
        },
      }
    );

    return data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching featured courses:", error);
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    const errorWithOriginal = enhancedError as Error & {
      originalError?: unknown;
    };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}

