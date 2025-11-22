import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface LocalLoginRequest {
  email: string;
  password: string;
  provider?: "local";
}

export interface OAuthLoginRequest {
  email: string;
  provider: "google" | "facebook";
  providerId: string;
}

export type LoginRequest = LocalLoginRequest | OAuthLoginRequest;

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    refresh_token?: string;
    user?: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      user_type?: string;
    };
  };
}

/**
 * Login user via backend API
 * Supports both local (email/password) and OAuth (Google/Facebook) authentication
 * @param credentials - User credentials (local or OAuth)
 * @returns Login response with token
 */
export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  try {
    // Default to local provider if not specified
    const loginPayload = 
      credentials.provider === "google" || credentials.provider === "facebook"
        ? {
            email: credentials.email,
            provider: credentials.provider,
            providerId: credentials.providerId,
          }
        : {
            email: credentials.email,
            password: (credentials as LocalLoginRequest).password,
            provider: "local",
          };

    const { data } = await axiosInstance.post<LoginResponse>(
      "/api/v1/user/login",
      loginPayload
    );

    if (data.status !== "success") {
      throw new Error(data.message || "Login failed");
    }

    return data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

