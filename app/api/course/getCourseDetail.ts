import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface CourseDetailInstructor {
  instructorId: number;
  name: string;
  bio: string;
  professionalTitle: string;
  profilePictureId: number;
  profilePictureUrl: string | null;
}

export interface CourseDetailCategory {
  categoryId: string;
  name: string;
  slug: string;
}

export interface CourseDetailPricing {
  pricingId: string;
  currency: string;
  amount: number;
  originalAmount: number;
  discountPercentage: number;
  priceTier: string;
}

export interface CourseDetailStats {
  avgRating: number;
  totalReviews: number;
  totalStudents: number;
  totalLectures: number;
  totalSections: number;
  totalDuration: number;
  viewsCount: number;
}

export interface CourseLearningPoint {
  learningPointId: string;
  description: string;
  displayOrder: number;
}

export interface CourseRequirement {
  requirementId: string;
  description: string;
  displayOrder: number;
}

export interface CourseTargetAudience {
  audienceId: string;
  description: string;
  displayOrder: number;
}

export interface CourseTag {
  tagId: string;
  tagName: string;
}

export interface CoursePreviewLecture {
  lectureId: string;
  title: string;
  duration: number;
  durationFormatted: string;
  videoId: number;
  videoUrl: string | null;
  isPreview: boolean;
}

export interface CourseDetail {
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  learningLevel: string;
  language: string;
  status: string;
  promoVideoId: number;
  promoVideoUrl: string | null;
  courseBannerId: number;
  courseBannerUrl: string;
  courseLogoId: number;
  courseLogoUrl: string;
  welcomeMessage: string;
  congratulationMessage: string;
  isEnrolled: boolean;
  enrollmentId: string | null;
  instructor: CourseDetailInstructor;
  category: CourseDetailCategory;
  pricing: CourseDetailPricing;
  stats: CourseDetailStats;
  learningPoints: CourseLearningPoint[];
  requirements: CourseRequirement[];
  targetAudience: CourseTargetAudience[];
  tags: CourseTag[];
  previewLectures: CoursePreviewLecture[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetailResponse {
  success: boolean;
  message: string;
  data: CourseDetail;
}

/**
 * Get course detail by slug
 * Public endpoint - no authentication required
 */
export async function getCourseDetail(
  courseSlug: string
): Promise<CourseDetail> {
  try {
    const { data } = await axiosInstance.get<CourseDetailResponse>(
      `/api/instructor/courses/${courseSlug}/detail`
    );

    return data.data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching course detail:", error);
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    const errorWithOriginal = enhancedError as Error & {
      originalError?: unknown;
    };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}

