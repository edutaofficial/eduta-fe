import axios from "../axiosInstance";

export interface SearchCoursesParams {
  query?: string | null;
  categoryId?: string | null; // Can be comma-separated list of category IDs (deprecated, use categorySlug)
  categorySlug?: string | null; // Can be comma-separated list of category slugs (SEO-friendly)
  learningLevel?: string | null; // Can be comma-separated list of levels
  language?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isFree?: boolean | null;
  minRating?: number | null;
  minDuration?: number | null; // Minimum duration in hours
  maxDuration?: number | null; // Maximum duration in hours
  sortBy?: "created_at" | "title" | "published_at";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CourseInstructor {
  instructorId: number;
  firstName: string;
  lastName: string;
  specialization: string;
}

export interface CourseCategory {
  categoryId: string;
  name: string;
  slug: string;
}

export interface CoursePricing {
  currency: string;
  amount: string;
  originalAmount: string;
  discountPercentage: number;
}

export interface CourseStats {
  totalStudents: number;
  totalLectures: number;
  totalDurationFormatted: string;
  avgRating: string;
  totalReviews: number;
  viewsCount: number;
}

export interface PublicCourse {
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  courseBannerId: number | null;
  courseBannerUrl: string | null;
  courseLogoId: number | null;
  courseLogoUrl: string | null;
  learningLevel: string;
  language: string;
  instructor: CourseInstructor;
  category: CourseCategory;
  pricing: CoursePricing | null;
  stats: CourseStats;
  createdAt: string;
}

export interface SearchCoursesResponse {
  success: boolean;
  message: string;
  data:{courses: PublicCourse[]};
  meta: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Search and filter public courses
 * Public endpoint - no authentication required
 */
export async function searchCourses(
  params: SearchCoursesParams
): Promise<SearchCoursesResponse> {
  try {
    // Build query params
    const queryParams = new URLSearchParams();

    // Add only defined parameters
    if (params.query) queryParams.append("query", params.query);
    // Prefer categorySlug over categoryId for SEO-friendly URLs
    if (params.categorySlug) {
      queryParams.append("categorySlug", params.categorySlug);
    } else if (params.categoryId) {
      queryParams.append("categoryId", params.categoryId);
    }
    if (params.learningLevel) queryParams.append("learningLevel", params.learningLevel);
    if (params.language) queryParams.append("language", params.language);
    if (params.minPrice !== null && params.minPrice !== undefined) {
      queryParams.append("minPrice", params.minPrice.toString());
    }
    if (params.maxPrice !== null && params.maxPrice !== undefined) {
      queryParams.append("maxPrice", params.maxPrice.toString());
    }
    if (params.isFree !== null && params.isFree !== undefined) {
      queryParams.append("isFree", params.isFree.toString());
    }
    if (params.minRating !== null && params.minRating !== undefined) {
      queryParams.append("minRating", params.minRating.toString());
    }
    if (params.minDuration !== null && params.minDuration !== undefined) {
      queryParams.append("minDuration", params.minDuration.toString());
    }
    if (params.maxDuration !== null && params.maxDuration !== undefined) {
      queryParams.append("maxDuration", params.maxDuration.toString());
    }
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.order) queryParams.append("order", params.order);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    const response = await axios.get<SearchCoursesResponse>(
      `/api/v1/courses/search?${queryParams.toString()}`
    );

    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error searching courses:", error);
    throw error;
  }
}

