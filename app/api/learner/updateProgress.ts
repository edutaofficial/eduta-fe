import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface UpdateProgressRequest {
  enrollment_id: string;
  lecture_id: string;
  is_completed: boolean;
  watch_time: number;
  last_position: number;
}

export interface UpdateProgressData {
  progressId: string;
  lectureId: string;
  isCompleted: boolean;
  completedAt: string;
  watchTime: number;
  lastPosition: number;
  courseCompleted: boolean;
  courseProgressPercentage: number;
  certificateGenerated: boolean;
}

export interface UpdateProgressResponse {
  success: boolean;
  message: string;
  data: UpdateProgressData;
}

/**
 * Update lecture progress for a learner
 */
export async function updateProgress(
  payload: UpdateProgressRequest
): Promise<UpdateProgressData> {
  try {
    const { data } = await axiosInstance.put<UpdateProgressResponse>(
      "/api/v1/learner/progress/update",
      payload
    );

    return data.data;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Error updating progress:", error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

