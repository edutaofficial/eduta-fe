import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface LectureResource {
  resourceId: string;
  assetId: number;
  resourceName: string;
  resourceType: string;
  displayOrder: number;
}

export interface Lecture {
  lectureId: string;
  title: string;
  description: string;
  videoId: number;
  duration: number;
  durationFormatted: string;
  displayOrder: number;
  lectureType: string;
  isPreview: boolean;
  isCompleted: boolean;
  watchTime: number;
  lastPosition: number;
  resources: LectureResource[];
}

export interface Section {
  sectionId: string;
  title: string;
  description: string;
  displayOrder: number;
  lectureCount: number;
  totalDuration: number;
  completedLectures: number;
  progressPercentage: number;
  lectures: Lecture[];
}

export interface CourseContent {
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  courseBannerId: number;
  courseLogoId: number;
  instructorName: string;
  enrollmentId: string;
  enrolledAt: string;
  overallProgress: number;
  totalLectures: number;
  completedLectures: number;
  totalDuration: number;
  sections: Section[];
}

export interface GetCourseContentResponse {
  success: boolean;
  message: string;
  data: CourseContent;
}

/**
 * Fetch course content with progress for a learner
 */
export async function getCourseContent(
  courseId: string
): Promise<CourseContent> {
  try {
    const { data } = await axiosInstance.get<GetCourseContentResponse>(
      `/api/v1/learner/courses/${courseId}/content`
    );

    return data.data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching course content:", error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

