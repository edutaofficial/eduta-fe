import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface InstructorCourse {
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  courseBannerId: number;
  courseBannerUrl: string;
  courseLogoId: number;
  courseLogoUrl: string;
  learningLevel: string;
  language: string;
  categoryName: string;
  price: number;
  currency: string;
  avgRating: number;
  totalStudents: number;
  totalReviews: number;
  publishedAt: string;
}

export interface InstructorCoursesPagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GetInstructorCoursesResponse {
  success: boolean;
  message: string;
  data: {
    courses: InstructorCourse[];
    pagination: InstructorCoursesPagination;
  };
}

export interface GetInstructorCoursesParams {
  page?: number;
  pageSize?: number;
}

/**
 * Fetch instructor courses with pagination
 */
export async function getInstructorCourses(
  instructorId: number,
  params: GetInstructorCoursesParams = {}
): Promise<GetInstructorCoursesResponse["data"]> {
  try {
    const { data } = await axiosInstance.get<GetInstructorCoursesResponse>(
      `/api/v1/instructors/${instructorId}/courses`,
      {
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 12,
        },
      }
    );

    return data.data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching instructor courses:", error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

