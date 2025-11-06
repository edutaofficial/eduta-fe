import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/utils/errorUtils";

export interface InstructorCoursesParams {
  instructorId: number;
  query?: string | null;
  categoryId?: string | null;
  status?: "draft" | "published" | "archived" | "all";
  learningLevel?: "beginner" | "intermediate" | "advanced" | null;
  language?: string | null;
  minRating?: number | null;
  maxRating?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isFree?: boolean | null;
  sortBy?: "created_at" | "title" | "published_at" | "rating" | "price";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface InstructorCourse {
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  learningLevel: string;
  language: string;
  status: "draft" | "published" | "archived";
  courseBannerId: number | null;
  courseLogoId: number | null;
  instructorId: number;
  instructorName: string;
  categoryId: string;
  categoryName: string;
  price: number;
  currency: string;
  originalPrice: number;
  discountPercentage: number;
  avgRating: number;
  totalReviews: number;
  totalStudents: number;
  totalLectures: number;
  totalDuration: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface InstructorCoursesResponse {
  success: boolean;
  message: string;
  data: InstructorCourse[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getInstructorCourses(
  params: InstructorCoursesParams
): Promise<InstructorCoursesResponse> {
  try {
    // Build query params, removing null/undefined values
    const queryParams: Record<string, string | number | boolean> = {
      instructorId: params.instructorId,
    };

    if (params.query) queryParams.query = params.query;
    if (params.categoryId) queryParams.categoryId = params.categoryId;
    if (params.status) queryParams.status = params.status;
    if (params.learningLevel) queryParams.learningLevel = params.learningLevel;
    if (params.language) queryParams.language = params.language;
    if (params.minRating !== null && params.minRating !== undefined)
      queryParams.minRating = params.minRating;
    if (params.maxRating !== null && params.maxRating !== undefined)
      queryParams.maxRating = params.maxRating;
    if (params.minPrice !== null && params.minPrice !== undefined)
      queryParams.minPrice = params.minPrice;
    if (params.maxPrice !== null && params.maxPrice !== undefined)
      queryParams.maxPrice = params.maxPrice;
    if (params.isFree !== null && params.isFree !== undefined)
      queryParams.isFree = params.isFree;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.order) queryParams.order = params.order;
    if (params.page) queryParams.page = params.page;
    if (params.pageSize) queryParams.pageSize = params.pageSize;

    const { data } = await axiosInstance.get<InstructorCoursesResponse>(
      "/api/instructor/courses/list",
      { params: queryParams }
    );

    return data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching instructor courses:", error);
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    const errorWithOriginal = enhancedError as Error & {
      originalError?: unknown;
    };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}

