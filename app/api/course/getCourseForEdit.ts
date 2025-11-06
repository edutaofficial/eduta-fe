import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/utils/errorUtils";
import type { UIBasicInfo, UICurriculum, UIPricing } from "@/types/course";

export interface CourseForEditResponse {
  courseId: string;
  basicInfo: UIBasicInfo;
  curriculum: UICurriculum;
  pricing: UIPricing;
}

/**
 * Fetch complete course details for editing
 * Transforms backend response to match our store structure
 */
export async function getCourseForEdit(
  courseId: string
): Promise<CourseForEditResponse> {
  try {
    const { data } = await axiosInstance.get<{
      // Basic Info
      title: string;
      short_description: string;
      description: string;
      learning_level: string;
      language: string;
      category_id: string;
      course_logo_id: number | null;
      course_banner_id: number | null;
      promo_video_id: number | null;
      learning_points: Array<{ id: string; text: string }>;
      target_audiences: Array<{ id: string; text: string }>;
      prerequisites: Array<{ id: string; text: string }>;
      // Curriculum
      sections: Array<{
        section_id: string;
        title: string;
        description: string;
        order: number;
        lectures: Array<{
          lecture_id: string;
          title: string;
          description: string;
          order: number;
          duration: number;
          is_free: boolean;
          video_id: number | null;
          resources: Array<{
            resource_id: string;
            title: string;
            file_id: number;
          }>;
        }>;
      }>;
      // Pricing
      price: number;
      currency: string;
      original_price: number;
      discount_percentage: number;
    }>(`/api/instructor/courses/${courseId}`);

    // Transform to UI format
    const basicInfo: UIBasicInfo = {
      title: data.title || "",
      shortDescription: data.short_description || "",
      description: data.description || "",
      learningLevel: data.learning_level || "",
      language: data.language || "",
      categoryId: data.category_id || "",
      courseLogoId: data.course_logo_id,
      courseBannerId: data.course_banner_id,
      promoVideoId: data.promo_video_id,
      learningPoints: data.learning_points || [],
      targetAudiences: data.target_audiences || [],
      prerequisites: data.prerequisites || [],
    };

    const curriculum: UICurriculum = {
      sections:
        data.sections?.map((section) => ({
          id: section.section_id,
          title: section.title,
          description: section.description,
          order: section.order,
          lectures:
            section.lectures?.map((lecture) => ({
              id: lecture.lecture_id,
              title: lecture.title,
              description: lecture.description,
              order: lecture.order,
              duration: lecture.duration,
              isFree: lecture.is_free,
              videoId: lecture.video_id,
              resources:
                lecture.resources?.map((resource) => ({
                  id: resource.resource_id,
                  title: resource.title,
                  fileId: resource.file_id,
                })) || [],
            })) || [],
        })) || [],
    };

    const pricing: UIPricing = {
      price: data.price ?? 0,
      currency: data.currency || "USD",
      originalPrice: data.original_price,
      discountPercentage: data.discount_percentage,
    };

    return {
      courseId,
      basicInfo,
      curriculum,
      pricing,
    };
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching course for edit:", error);
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    const errorWithOriginal = enhancedError as Error & {
      originalError?: unknown;
    };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}

/**
 * Determine which step to navigate to based on what's missing
 */
export function determineIncompleteStep(course: {
  title?: string;
  shortDescription?: string;
  learningLevel?: string;
  language?: string;
  categoryId?: string;
  courseBannerId?: number | null;
  courseLogoId?: number | null;
  totalLectures?: number;
  totalDuration?: number;
  price?: number;
}): 1 | 2 | 3 | 4 {
  // Step 1: Basic Info
  const hasBasicInfo =
    !!course.title &&
    !!course.shortDescription &&
    !!course.learningLevel &&
    !!course.language &&
    !!course.categoryId &&
    course.courseBannerId !== null &&
    course.courseLogoId !== null;

  if (!hasBasicInfo) return 1;

  // Step 2: Curriculum
  const hasCurriculum =
    (course.totalLectures || 0) > 0 && (course.totalDuration || 0) > 0;

  if (!hasCurriculum) return 2;

  // Step 3: Pricing
  const hasPricing = course.price !== null && course.price !== undefined;

  if (!hasPricing) return 3;

  // Step 4: Finalize (if everything else is complete)
  return 4;
}


