import axiosInstance from "../axiosInstance";
import { API_CONFIG } from "@/lib/config/api";

// ============================================
// Create Review
// ============================================

export interface CreateReviewRequest {
  course_id: string;
  enrollment_id: string;
  rating: number;
  review_text: string;
  is_published: boolean;
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data: {
    reviewId: string;
    courseId: string;
    userId: number;
    enrollmentId: string;
    rating: number;
    reviewText: string;
    isPublished: boolean;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export async function createReview(
  data: CreateReviewRequest
): Promise<CreateReviewResponse["data"]> {
  const response = await axiosInstance.post<CreateReviewResponse>(
    `${API_CONFIG.BASE_URL}api/v1/learner/courses/reviews`,
    data
  );
  return response.data.data;
}

// ============================================
// Get Course Reviews
// ============================================

export interface CourseReview {
  reviewId: string;
  courseId: string;
  userId: number;
  userName?: string; // May be added by backend later
  userAvatar?: string; // May be added by backend later
  enrollmentId: string;
  rating: number;
  reviewText: string;
  isPublished: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetCourseReviewsParams {
  page?: number;
  page_size?: number;
}

export interface GetCourseReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: CourseReview[];
    totalReviews: number;
    averageRating: number;
  };
}

export async function getCourseReviews(
  courseId: string,
  params: GetCourseReviewsParams = {}
): Promise<GetCourseReviewsResponse["data"]> {
  const response = await axiosInstance.get<GetCourseReviewsResponse>(
    `${API_CONFIG.BASE_URL}api/v1/learner/courses/${courseId}/reviews`,
    {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 10,
      },
    }
  );
  return response.data.data;
}

