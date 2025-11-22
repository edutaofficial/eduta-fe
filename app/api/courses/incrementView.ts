import axiosInstance from "@/app/api/axiosInstance";

export interface IncrementViewResponse {
  success: boolean;
  message: string;
  viewsCount: number;
}

/**
 * Increment view count for a course
 * @param courseIdOrSlug - The ID or slug of the course
 * @returns Promise with the response data
 */
export const incrementCourseView = async (
  courseIdOrSlug: string
): Promise<IncrementViewResponse> => {
  const response = await axiosInstance.post<IncrementViewResponse>(
    `/api/v1/courses/${courseIdOrSlug}/view`
  );
  return response.data;
};

