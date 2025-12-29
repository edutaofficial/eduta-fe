import axiosInstance from "../axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface InstructorCourseQuestion {
  questionId: string;
  lectureId: string;
  courseId: string;
  userId: number;
  content: string;
  status: "open" | "answered" | "closed" | string;
  answer: string | null;
  answeredBy: number | null;
  answeredAt: string | null;
  createdAt: string;
}

interface GetCourseQuestionsResponse {
  success: boolean;
  message: string;
  data: {
    questions: InstructorCourseQuestion[];
  };
}

interface AnswerCourseQuestionResponse {
  success: boolean;
  message: string;
  data?: {
    question: InstructorCourseQuestion;
  };
}

export async function getInstructorCourseQuestions(
  courseId: string
): Promise<InstructorCourseQuestion[]> {
  try {
    const { data } = await axiosInstance.get<GetCourseQuestionsResponse>(
      `/api/instructor/courses/${courseId}/questions`
    );

    return data.data.questions;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

export async function answerInstructorCourseQuestion(
  questionId: string,
  answer: string
): Promise<InstructorCourseQuestion | null> {
  try {
    const { data } = await axiosInstance.post<AnswerCourseQuestionResponse>(
      `/api/instructor/courses/questions/${questionId}/answer`,
      { answer }
    );

    return data.data?.question ?? null;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

