import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface LectureQuestion {
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
}

export interface CreateLectureQuestionRequest {
  lectureId: string;
  courseId: string;
  content: string;
}

interface CreateLectureQuestionResponse {
  questionId: string;
  lectureId: string;
  courseId: string;
  userId: number;
  content: string;
  status: string;
  answer: string | null;
  answeredBy: number | null;
  answeredAt: string | null;
  createdAt: string;
}

interface GetLectureQuestionsResponse {
  success: boolean;
  data: {
    questions: LectureQuestion[];
  };
  message: string;
}

export async function createLectureQuestion(
  payload: CreateLectureQuestionRequest
): Promise<CreateLectureQuestionResponse> {
  try {
    const { data } = await axiosInstance.post<CreateLectureQuestionResponse>(
      `/api/v1/learner/lectures/${payload.lectureId}/questions`,
      payload
    );

    return data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

export async function getLectureQuestions(
  lectureId: string
): Promise<LectureQuestion[]> {
  try {
    const { data } = await axiosInstance.get<GetLectureQuestionsResponse>(
      `/api/v1/learner/lectures/${lectureId}/questions`
    );

    return data.data.questions;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}


