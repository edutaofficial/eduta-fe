import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

function getBaseURL(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }
  return baseUrl;
}

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const session = await getSession();
    const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
    return accessToken || null;
  } catch {
    return null;
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds for regular requests
});

// Create a separate instance for file uploads with no timeout
export const axiosUploadInstance: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
  timeout: 0, // No timeout for uploads - allow large files and slow connections
});

// Shared request interceptor function
const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {};
  
  // Add ngrok bypass header if using ngrok URL
  if (config.baseURL?.includes("ngrok")) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }

  // Add auth token
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to get token:", error);
  }

  return config;
};

const requestErrorInterceptor = (error: AxiosError) => {
  return Promise.reject(error);
};

// Apply interceptors to main instance
axiosInstance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

// Apply interceptors to upload instance
axiosUploadInstance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

// Shared response interceptors
const responseSuccessInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Check if response is HTML instead of JSON (ngrok warning page)
  const contentType = (response.headers["content-type"] as string) || "";
  if (contentType.includes("text/html")) {
    throw new Error(
      "Received HTML instead of JSON. This may be an ngrok warning page. " +
      "Try visiting the ngrok URL directly in your browser first."
    );
  }
  return response;
};

const responseErrorInterceptor = async (error: AxiosError) => {
  const status = error.response?.status;
  const responseData = error.response?.data as Record<string, unknown> | undefined;

  // Log error in development (but not timeout errors for uploads)
  if (process.env.NODE_ENV === "development") {
    const isUploadTimeout = error.code === "ECONNABORTED" && error.config?.url?.includes("/upload");
    if (!isUploadTimeout) {
      // eslint-disable-next-line no-console
      console.error("API Error:", {
        message: error.message,
        status,
        url: error.config?.url,
        data: responseData,
      });
    }
  }

  // Parse validation errors (422 - Unprocessable Entity)
  if (status === 422 && responseData?.detail) {
    const validationErrors: Record<string, string> = {};
    
    // Handle Pydantic validation errors (FastAPI format)
    if (Array.isArray(responseData.detail)) {
      (responseData.detail as Array<Record<string, unknown>>).forEach((err) => {
        // Extract field path from loc array (e.g., ["body", "description"] -> "description")
        const fieldPath = Array.isArray(err.loc) 
          ? (err.loc as Array<string>).filter((loc) => loc !== "body").join(".")
          : "general";
        const message = (err.msg as string) || "Validation error";
        validationErrors[fieldPath] = message;
      });
    }
    
    // Attach parsed errors to error object
    const errorWithValidation = error as AxiosError & { validationErrors?: Record<string, string>; isValidationError?: boolean };
    errorWithValidation.validationErrors = validationErrors;
    errorWithValidation.isValidationError = true;
    
    // Create a user-friendly message
    const firstError = Object.values(validationErrors)[0];
    error.message = firstError || "Validation failed. Please check your input.";
  }
  // Handle other common HTTP errors with user-friendly messages
  else if (status === 400) {
    error.message = (responseData?.message as string) || (responseData?.detail as string) || "Invalid request. Please check your input.";
  }
  else if (status === 401) {
    error.message = "You are not authorized. Please log in again.";
    // Optional: Redirect to login
    // window.location.href = '/login';
  }
  else if (status === 403) {
    error.message = "You don't have permission to perform this action.";
  }
  else if (status === 404) {
    error.message = "The requested resource was not found.";
  }
  else if (status === 409) {
    error.message = (responseData?.message as string) || (responseData?.detail as string) || "A conflict occurred. This resource may already exist.";
  }
  else if (status && status >= 500) {
    error.message = "Internal server error. Please try again later.";
  }
  else if (!status) {
    error.message = "Network error. Please check your internet connection.";
  }

  return Promise.reject(error);
};

// Apply response interceptors to both instances
axiosInstance.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);
axiosUploadInstance.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

export default axiosInstance;
