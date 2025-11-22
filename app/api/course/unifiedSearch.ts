import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface UnifiedSearchCourse {
  courseId: string;
  slug?: string; // Course slug for routing (preferred over courseId)
  title: string;
  shortDescription: string;
  imageUrl: string;
  enrolledCount: number;
}

export interface UnifiedSearchInstructor {
  instructorId: number;
  name: string;
  bio: string;
  imageUrl: string | null;
  coursesCount: number;
}

export interface UnifiedSearchResponse {
  success: boolean;
  message: string;
  data: {
    courses: UnifiedSearchCourse[];
    instructors: UnifiedSearchInstructor[];
  };
}

/**
 * Unified search for courses and instructors
 * @param query - Search query (searches in course titles/descriptions and instructor names)
 */
export async function unifiedSearch(
  query: string
): Promise<UnifiedSearchResponse["data"]> {
  try {
    if (!query || query.trim().length === 0) {
      return { courses: [], instructors: [] };
    }

    const { data } = await axiosInstance.get<UnifiedSearchResponse>(
      "/api/v1/courses/unified",
      {
        params: { query: query.trim() },
      }
    );

    return data.data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error performing unified search:", error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

