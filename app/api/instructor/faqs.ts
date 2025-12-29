import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface FAQ {
  faqId: string;
  question: string;
  answer: string;
}

export interface FAQRequest {
  question: string;
  answer: string;
}

export interface FAQUpdateRequest {
  faq_id: string;
  question: string;
  answer: string;
}

export interface FAQsResponse {
  success: boolean;
  message: string;
  data: {
    faqs: FAQ[];
  };
}

export interface DeleteFAQResponse {
  success: boolean;
  message: string;
  data: {
    faqId: string;
    deletedAt: string;
  };
}

/**
 * Add multiple FAQs to a course
 */
export async function addFAQs(
  courseId: string,
  faqs: FAQRequest[]
): Promise<FAQ[]> {
  try {
    const { data } = await axiosInstance.post<FAQsResponse>(
      `/api/instructor/courses/${courseId}/faqs`,
      faqs
    );

    return data.data.faqs;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Update multiple existing FAQs
 */
export async function updateFAQs(
  courseId: string,
  faqs: FAQUpdateRequest[]
): Promise<FAQ[]> {
  try {
    const { data } = await axiosInstance.put<FAQsResponse>(
      `/api/instructor/courses/${courseId}/faqs`,
      faqs
    );

    return data.data.faqs;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Get all FAQs for a course
 */
export async function getFAQs(courseId: string): Promise<FAQ[]> {
  try {
    const { data } = await axiosInstance.get<FAQsResponse>(
      `/api/instructor/courses/${courseId}/faqs`
    );

    return data.data.faqs;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Delete an existing FAQ
 */
export async function deleteFAQ(
  courseId: string,
  faqId: string
): Promise<DeleteFAQResponse["data"]> {
  try {
    const { data } = await axiosInstance.delete<DeleteFAQResponse>(
      `/api/instructor/courses/${courseId}/faqs/${faqId}`
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

