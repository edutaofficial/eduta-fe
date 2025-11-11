import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { getBaseUrl } from "@/lib/config/api";

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

// Refresh access token using refresh token
async function refreshAccessToken(refreshToken: string): Promise<{ token: string; refresh_token: string } | null> {
  try {
    const response = await axios.post(
      `${getBaseUrl()}/api/v1/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response.data?.token && response.data?.refresh_token) {
      return {
        token: response.data.token,
        refresh_token: response.data.refresh_token,
      };
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Token refresh failed:", error);
    return null;
  }
}

// Update NextAuth session with new tokens
async function updateSession(newAccessToken: string, newRefreshToken: string): Promise<void> {
  if (typeof window === "undefined") return;
  
  try {
    // Update the session by making a PATCH request to NextAuth's session endpoint
    // This triggers the jwt callback with trigger: "update"
    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Now update the session with new tokens
      const event = new CustomEvent("session", {
        detail: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
      window.dispatchEvent(event);
    }

    // Store tokens temporarily in sessionStorage for immediate use
    // This ensures the next request uses the new token while session updates in background
    sessionStorage.setItem("_refresh_access_token", newAccessToken);
    sessionStorage.setItem("_refresh_refresh_token", newRefreshToken);

    // Clear temporary tokens after session has time to update
    setTimeout(() => {
      sessionStorage.removeItem("_refresh_access_token");
      sessionStorage.removeItem("_refresh_refresh_token");
    }, 5000);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to update session:", error);
  }
}

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

// Legacy function for backward compatibility
async function _getToken(): Promise<string | null> {
  const { accessToken } = await getTokens();
  return accessToken;
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

// Simple request interceptor - just add token if available
const requestInterceptor = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  config.headers = config.headers ?? {};
  
  // Add ngrok bypass header if using ngrok URL
  if (config.baseURL?.includes("ngrok")) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }

  // Get current access token and add to request
  try {
    const { accessToken } = await getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
  // HANDLE 401 UNAUTHORIZED - TOKEN REFRESH LOGIC
  // ============================================================================
  if (status === 401 && originalRequest && !originalRequest._retry) {
    // Skip token refresh for auth endpoints (login, signup, etc.)
    const isAuthEndpoint = originalRequest.url?.includes("/api/v1/auth/login") || 
                           originalRequest.url?.includes("/api/v1/auth/signup") ||
                           originalRequest.url?.includes("/api/v1/auth/verify");
    
    if (isAuthEndpoint) {
      error.message = getBackendErrorMessage() || "Authentication failed. Please check your credentials.";
      return Promise.reject(error);
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;

    if (isRefreshing) {
      // If already refreshing, queue this request
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
      const { refreshToken } = await getTokens();
      
      if (!refreshToken) {
        // No refresh token available, sign out
        processQueue(new Error("No refresh token available"), null);
        await signOut({ redirect: true, callbackUrl: "/login" });
        return Promise.reject(error);
      }

      // Attempt to refresh the token
      const refreshedTokens = await refreshAccessToken(refreshToken);
      
      if (refreshedTokens) {
        // Update session with new tokens
        await updateSession(refreshedTokens.token, refreshedTokens.refresh_token);
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${refreshedTokens.token}`;
        
        // Process all queued requests with new token
        processQueue(null, refreshedTokens.token);
        
        // Retry the original request with new token
        return axios(originalRequest);
      } else {
        // Refresh failed, sign out
        processQueue(new Error("Token refresh failed"), null);
        await signOut({ redirect: true, callbackUrl: "/login" });
        return Promise.reject(error);
      }
    } catch (refreshError) {
      // eslint-disable-next-line no-console
      console.error("Error during token refresh:", refreshError);
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
