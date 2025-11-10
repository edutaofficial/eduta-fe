import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface EnrolledCourse {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  shortDescription: string;
  courseBannerId: number;
  courseBannerUrl?: string; // Optional: URL to course banner image
  courseLogoId: number;
  courseLogoUrl?: string; // Optional: URL to course logo image
  instructorName: string;
  categoryName: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercentage: number;
  totalLectures: number;
  completedLectures: number;
  totalDuration: number;
  status: string;
  hasCertificate: boolean;
  certificateId: string | null;
}

export interface EnrolledCoursesResponse {
  success: boolean;
  message: string;
  data: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    courses: EnrolledCourse[];
  };
}

/**
 * Get all enrolled courses for learner
 */
export async function getEnrolledCourses(): Promise<EnrolledCoursesResponse["data"]> {
  try {
    const { data } = await axiosInstance.get<EnrolledCoursesResponse>(
      "/api/v1/learner/courses/enrolled"
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

