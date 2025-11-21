import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface Certificate {
  certificateId: string;
  certificateNumber: string;
  certificateTitle: string;
  recipientName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  expiresAt: string | null;
  verificationCode: string;
  certificateUrl: string | null;
  isActive: boolean;
}

export interface CertificatesResponse {
  success: boolean;
  message: string;
  data: {
    totalCertificates: number;
    activeCertificates: number;
    certificates: Certificate[];
  };
}

/**
 * Get all certificates for learner
 */
export async function getCertificates(): Promise<CertificatesResponse["data"]> {
  try {
    const { data } = await axiosInstance.get<CertificatesResponse>(
      "/api/v1/learner/certificates"
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

export interface CertificateDetail {
  certificateId: string;
  enrollmentId: string;
  courseId: string;
  certificateNumber: string;
  certificateTitle: string;
  recipientName: string;
  courseTitle: string;
  courseSlug: string;
  courseBannerUrl: string;
  courseLogoUrl: string;
  instructorName: string;
  issuedAt: string;
  expiresAt: string;
  verificationCode: string;
  certificateUrl: string;
  description: string;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateDetailResponse {
  success: boolean;
  message: string;
  data: CertificateDetail;
}

/**
 * Get certificate by ID (public endpoint for verification)
 */
export async function getCertificateById(
  certificateId: string
): Promise<CertificateDetail> {
  try {
    const { data } = await axiosInstance.get<CertificateDetailResponse>(
      `/api/v1/certificate/${certificateId}`
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

