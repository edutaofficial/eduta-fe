import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";
import type { UIBasicInfo, UICurriculum, UIPricing, CourseDetailApiResponse } from "@/types/course";

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
    const { data } = await axiosInstance.get<CourseDetailApiResponse>(
      `/api/instructor/courses/${courseId}`
    );

    // eslint-disable-next-line no-console
    console.log("API Response:", data);

    const courseData = data.data;

    // Transform to UI format
    const basicInfo: UIBasicInfo = {
      title: courseData.courseDetails.title || "",
      shortDescription: courseData.courseDetails.description || "",
      description: courseData.courseDetails.description || "",
      learningLevel: courseData.courseDetails.learningLevel || "",
      language: courseData.courseDetails.language || "",
      categoryId: courseData.courseDetails.categoryId || "",
      courseLogoId: courseData.courseDetails.courseLogoId,
      courseBannerId: courseData.courseDetails.courseBannerId,
      promoVideoId: courseData.courseDetails.promoVideoId,
      learningPoints: courseData.courseDetails.learningPoints.map((lp, index) => ({
        id: lp.learningPointId || `lp-${index}`,
        text: lp.description,
      })),
      targetAudiences: courseData.courseDetails.targetAudience.map((ta, index) => ({
        id: ta.audienceId || `ta-${index}`,
        text: ta.description,
      })),
      prerequisites: courseData.courseDetails.requirements.map((req, index) => ({
        id: req.requirementId || `req-${index}`,
        text: req.description,
      })),
    };

    // eslint-disable-next-line no-console
    console.log("Transformed basicInfo:", basicInfo);

    const curriculum: UICurriculum = {
      sections: courseData.curriculum.sections.map((section) => ({
        id: section.sectionId,
          title: section.title,
          description: section.description,
        order: section.displayOrder,
        lectures: section.lectures.map((lecture) => ({
          id: lecture.lectureId,
              title: lecture.title,
              description: lecture.description,
          order: lecture.displayOrder,
              duration: lecture.duration,
          isFree: lecture.isPreview,
          videoId: lecture.videoId,
          resources: lecture.resources.map((resource) => ({
            id: resource.resourceId,
            title: resource.resourceName,
            fileId: resource.assetId,
          })),
        })),
      })),
    };

    const pricing: UIPricing = {
      price: courseData.pricing.amount ?? 0,
      currency: courseData.pricing.currency || "USD",
      originalPrice: courseData.pricing.originalAmount,
      discountPercentage: courseData.pricing.discountPercentage,
      isFree: courseData.pricing.amount === 0,
      priceTier: courseData.pricing.priceTier,
    };

    return {
      courseId: courseData.courseId,
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


