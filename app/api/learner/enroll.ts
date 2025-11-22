import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface EnrollmentData {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  instructorName: string;
  enrolledAt: string;
  progressPercentage: number;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: EnrollmentData;
}

/**
 * Enroll in a course
 */
export async function enrollCourse(
  courseId: string
): Promise<EnrollmentData> {
  try {
    const { data } = await axiosInstance.post<EnrollmentResponse>(
      "/api/v1/learner/enroll",
      { course_id: courseId }
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

