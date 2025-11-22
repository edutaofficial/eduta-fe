import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  user_type: "instructor" | "learner";
  professional_title?: string;
  bio?: string;
}

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
 * @param signupData - User registration data
 * @returns Signup response
 */
export async function signupUser(
  signupData: SignupRequest
): Promise<SignupResponse> {
  try {
    const { data } = await axiosInstance.post<SignupResponse>(
      "/api/v1/user",
      signupData
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

