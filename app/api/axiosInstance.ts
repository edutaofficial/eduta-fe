import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { getBaseUrl } from "@/lib/config/api";
import { magicalTokenRefresh, isTokenExpired } from "@/lib/tokenManager";

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

interface SessionWithTokens {
  accessToken?: string;
  refreshToken?: string;
}

// Get tokens from session
async function getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  try {
    // Check for refreshed tokens first (used immediately after token refresh)
    const refreshedAccessToken = sessionStorage.getItem("_refresh_access_token");
    const refreshedRefreshToken = sessionStorage.getItem("_refresh_refresh_token");
    
    if (refreshedAccessToken && refreshedRefreshToken) {
      return { 
        accessToken: refreshedAccessToken, 
        refreshToken: refreshedRefreshToken 
      };
    }
    
    // Fall back to session tokens
    const session = await getSession();
    const accessToken = (session as unknown as SessionWithTokens)?.accessToken || null;
    const refreshToken = (session as unknown as SessionWithTokens)?.refreshToken || null;
    return { accessToken, refreshToken };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

// Note: Token refresh logic has been moved to @/lib/tokenManager.ts
// The magical function handles all token refresh operations

// Process queued requests after token refresh
function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}


const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds for regular requests
});

// Create a separate instance for file uploads with no timeout
export const axiosUploadInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
  timeout: 0, // No timeout for uploads - allow large files and slow connections
});

// 🪄 Smart request interceptor - verify token before sending request
const requestInterceptor = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  config.headers = config.headers ?? {};
  
  // Add ngrok bypass header if using ngrok URL
  if (config.baseURL?.includes("ngrok")) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }

  // Skip token handling for auth endpoints
  const isAuthEndpoint = config.url?.includes("/api/v1/auth/login") || 
                         config.url?.includes("/api/v1/auth/signup") ||
                         config.url?.includes("/api/v1/auth/verify") ||
                         config.url?.includes("/api/v1/auth/refresh") ||
                         config.url?.includes("/api/v1/user/login") ||
                         (config.url?.includes("/api/v1/user") && config.method === "POST");
  
  if (isAuthEndpoint) {
    // eslint-disable-next-line no-console
    console.log("[Axios] Skipping auth token for endpoint", {
      url: config.url,
      method: config.method,
      isAuthEndpoint: true,
    });
    return config;
  }

  // Get current access token
  try {
    const { accessToken } = await getTokens();
    
    if (accessToken) {
      // 🪄 PROACTIVE CHECK: Verify token before request
      // If token is expired or about to expire, refresh it proactively
      if (isTokenExpired(accessToken)) {
        // eslint-disable-next-line no-console
        console.log("Token expired, proactively refreshing before request...");
        const newToken = await magicalTokenRefresh();
        
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          // If refresh fails, still try with old token (will fail and trigger 401 handler)
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } else {
        // Token is valid, use it
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
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
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  const status = error.response?.status;
  const responseData = error.response?.data as Record<string, unknown> | undefined;

  // Helper function to extract error message from backend response
  const getBackendErrorMessage = (): string | null => {
    if (responseData?.error) return responseData.error as string;
    if (responseData?.message) return responseData.message as string;
    if (responseData?.detail) return responseData.detail as string;
    return null;
  };

  // ============================================================================
  // HANDLE 401 UNAUTHORIZED - 🪄 MAGICAL TOKEN REFRESH LOGIC
  // ============================================================================
  if (status === 401 && originalRequest && !originalRequest._retry) {
    const backendMessage = getBackendErrorMessage();
    
    // Check if this is a token expiration error (various formats backend might use)
    const isTokenExpiredError = 
      backendMessage?.toLowerCase().includes("token is expired") ||
      backendMessage?.toLowerCase().includes("token expired") ||
      backendMessage?.toLowerCase().includes("token has expired") ||
      backendMessage?.toLowerCase().includes("jwt expired") ||
      backendMessage?.toLowerCase().includes("access token expired");

    // Skip token refresh for auth endpoints (login, signup, etc.)
    const isAuthEndpoint = originalRequest.url?.includes("/api/v1/auth/login") || 
                           originalRequest.url?.includes("/api/v1/auth/signup") ||
                           originalRequest.url?.includes("/api/v1/auth/verify") ||
                           originalRequest.url?.includes("/api/v1/user/login") ||
                           (originalRequest.url?.includes("/api/v1/user") && originalRequest.method === "POST");
    
    if (isAuthEndpoint || !isTokenExpiredError) {
      // If not an auth endpoint and not token expired, or if auth endpoint, reject
      error.message = backendMessage || "Authentication failed. Please check your credentials.";
      return Promise.reject(error);
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          },
          reject: (err: Error) => {
            reject(err);
          },
        });
      });
    }

    isRefreshing = true;

    try {
      // 🪄 MAGICAL TOKEN REFRESH - Call the magical function!
      const newAccessToken = await magicalTokenRefresh();
      
      if (newAccessToken) {
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Process all queued requests with new token
        processQueue(null, newAccessToken);
        
        // ✨ MAGIC: Silently retry the original request with new token
        return axios(originalRequest);
      } else {
        // Refresh failed, sign out
        processQueue(new Error("Token refresh failed"), null);
        await signOut({ redirect: true, callbackUrl: "/login" });
        return Promise.reject(error);
      }
    } catch (refreshError) {
      // eslint-disable-next-line no-console
      console.error("Magical token refresh failed:", refreshError);
      processQueue(refreshError as Error, null);
      await signOut({ redirect: true, callbackUrl: "/login" });
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }

  // ============================================================================
  // HANDLE OTHER HTTP ERRORS
  // ============================================================================

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
  // Always prioritize backend error messages for all status codes
  else {
    const backendMessage = getBackendErrorMessage();
    
    if (backendMessage) {
      // Use the exact error message from backend
      error.message = backendMessage;
    } else {
      // Fallback to generic messages only if backend doesn't provide one
      if (status === 400) {
        error.message = "Invalid request. Please check your input.";
      }
      else if (status === 403) {
        error.message = "You don't have permission to perform this action.";
      }
      else if (status === 404) {
        error.message = "The requested resource was not found.";
      }
      else if (status === 409) {
        error.message = "A conflict occurred. This resource may already exist.";
      }
      else if (status && status >= 500) {
        error.message = "Internal server error. Please try again later.";
      }
      else if (!status) {
        error.message = "Network error. Please check your internet connection.";
      }
    }
  }

  return Promise.reject(error);
};

// Apply response interceptors to both instances
axiosInstance.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);
axiosUploadInstance.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

export default axiosInstance;
