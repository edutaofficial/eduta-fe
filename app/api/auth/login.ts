import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface LoginRequest {
  email: string;
  password: string;
}

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
 * @param credentials - User email and password
 * @returns Login response with token
 */
export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  try {
    const { data } = await axiosInstance.post<LoginResponse>(
      "/api/v1/user/login",
      {
        email: credentials.email,
        password: credentials.password,
      }
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

