import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface LocalSignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  user_type: "instructor" | "learner";
  provider?: "local";
  professional_title?: string;
  bio?: string;
}

export interface OAuthSignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  user_type: "instructor" | "learner";
  provider: "google" | "facebook";
  providerId: string;
  professional_title?: string;
  bio?: string;
}

export type SignupRequest = LocalSignupRequest | OAuthSignupRequest;

export interface SignupResponse {
  status: string;
  message: string;
  error_code?: string;
  data?: {
    user_id: string;
    email: string;
  };
}

/**
 * Register a new user
 * Supports both local (email/password) and OAuth (Google/Facebook) signup
 * @param signupData - User registration data (local or OAuth)
 * @returns Signup response
 */
export async function signupUser(
  signupData: SignupRequest
): Promise<SignupResponse> {
  try {
    // Build payload based on provider type
    const signupPayload = 
      signupData.provider === "google" || signupData.provider === "facebook"
        ? {
            email: signupData.email,
            first_name: signupData.first_name,
            last_name: signupData.last_name,
            user_type: signupData.user_type,
            provider: signupData.provider,
            providerId: signupData.providerId,
            ...(signupData.professional_title && { professional_title: signupData.professional_title }),
            ...(signupData.bio && { bio: signupData.bio }),
          }
        : {
            email: signupData.email,
            first_name: signupData.first_name,
            last_name: signupData.last_name,
            password: (signupData as LocalSignupRequest).password,
            confirm_password: (signupData as LocalSignupRequest).confirm_password,
            user_type: signupData.user_type,
            provider: "local",
            ...(signupData.professional_title && { professional_title: signupData.professional_title }),
            ...(signupData.bio && { bio: signupData.bio }),
          };

    const { data } = await axiosInstance.post<SignupResponse>(
      "/api/v1/user",
      signupPayload
    );

    if (data.status !== "success") {
      // Handle duplicate email/nickname error
      if (data.error_code === "USER__DUPLICATE_EMAIL_OR_NICKNAME") {
        throw new Error("An account with this email already exists");
      }
      throw new Error(data.message || "Signup failed");
    }

    return data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Helper function to format name for signup
 */
export function formatNameForSignup(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const [firstName, ...rest] = fullName.trim().split(" ");
  const lastName = rest.join(" ");

  return {
    firstName: firstName || fullName,
    lastName: lastName || "",
  };
}

