import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface AskedQuestion {
  questionId: string;
  lectureId: string;
  courseId: string;
  userId: number;
  content: string;
  status: string | null;
  answer: string | null;
  answeredBy: number | null;
  answeredAt: string | null;
  createdAt: string;
  courseTitle?: string;
  lectureTitle?: string;
}

interface GetAskedQuestionsResponse {
  success: boolean;
  data: {
    questions: AskedQuestion[];
  };
  message: string;
}

/**
 * Fetch all questions asked by the learner
 */
export async function getAskedQuestions(): Promise<AskedQuestion[]> {
  try {
    const { data } = await axiosInstance.get<GetAskedQuestionsResponse>(
      "/api/v1/learner/questions"
    );

    return data.data.questions;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}


