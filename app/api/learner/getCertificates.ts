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
  certificateUrl: string;
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

