import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalReviews: number;
  avgRating: number;
}

export interface InstructorProfile {
  instructorId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  specialization: string;
  professionalTitle: string;
  profilePictureId: number;
  profilePictureUrl: string;
  bio: string;
  stats: InstructorStats;
  createdAt: string;
}

export interface GetInstructorProfileResponse {
  success: boolean;
  message: string;
  data: InstructorProfile;
}

/**
 * Fetch instructor profile information (without courses)
 */
export async function getInstructorProfile(
  instructorId: number
): Promise<InstructorProfile> {
  try {
    const { data } = await axiosInstance.get<GetInstructorProfileResponse>(
      `/api/v1/instructors/${instructorId}`
    );

    return data.data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error fetching instructor profile:", error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

