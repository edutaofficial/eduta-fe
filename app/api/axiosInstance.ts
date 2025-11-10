import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { getBaseUrl } from "@/lib/config/api";

// Token verification and refresh state management
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

interface SessionWithTokens {
  accessToken?: string;
  refreshToken?: string;
}

// Get tokens from session
async function getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  try {
    // Check for temporary tokens first (used during refresh)
    const tempAccessToken = sessionStorage.getItem("_temp_access_token");
    const tempRefreshToken = sessionStorage.getItem("_temp_refresh_token");
    
    if (tempAccessToken && tempRefreshToken) {
      return { accessToken: tempAccessToken, refreshToken: tempRefreshToken };
    }
    
    const session = await getSession();
    const accessToken = (session as unknown as SessionWithTokens)?.accessToken || null;
    const refreshToken = (session as unknown as SessionWithTokens)?.refreshToken || null;
    return { accessToken, refreshToken };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

// Verify token with backend
async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await axios.post(
      `${getBaseUrl()}/api/v1/auth/verify`,
      { token },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    
    return response.data?.is_verified === true || response.data?.status === "success";
  } catch {
    return false;
  }
}

// Refresh access token using refresh token
async function refreshAccessToken(token: string, refreshToken: string): Promise<{ token: string; refresh_token: string } | null> {
  try {
    const response = await axios.post(
      `${getBaseUrl()}/api/v1/auth/refresh`,
      { 
        token,
        refresh_token: refreshToken 
      },
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

// Update session with new tokens
async function updateSessionTokens(newAccessToken: string, newRefreshToken: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  try {
    // Store tokens in sessionStorage as a temporary cache
    // This allows immediate use of new tokens while session is being updated
    sessionStorage.setItem("_temp_access_token", newAccessToken);
    sessionStorage.setItem("_temp_refresh_token", newRefreshToken);
    
    // Trigger a session update by calling getSession with force refresh
    await getSession();
    
    // Clear temporary tokens after a short delay to ensure they're used
    setTimeout(() => {
      sessionStorage.removeItem("_temp_access_token");
      sessionStorage.removeItem("_temp_refresh_token");
    }, 2000);
    
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to update session:", error);
    return false;
  }
}

// Notify all subscribers when refresh is complete
function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Add subscriber to be notified when refresh completes
function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Legacy function for backward compatibility
async function getToken(): Promise<string | null> {
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

// Shared request interceptor function with token verification and refresh
const requestInterceptor = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  config.headers = config.headers ?? {};
  
  // Add ngrok bypass header if using ngrok URL
  if (config.baseURL?.includes("ngrok")) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }

  // Skip token verification for auth endpoints
  const isAuthEndpoint = config.url?.includes("/api/v1/auth/") || 
                         config.url?.includes("/api/v1/user/login") || 
                         config.url?.includes("/api/v1/user");
  
  if (isAuthEndpoint) {
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
  }

  // Get tokens from session
  try {
    let accessToken: string | null;
    const { accessToken: token, refreshToken } = await getTokens();
    accessToken = token;
    
    if (!accessToken) {
      // No token available, proceed without auth
      return config;
    }

    // Verify token validity
    const isValid = await verifyToken(accessToken);
    
    if (!isValid && refreshToken) {
      // Token is invalid/expired, attempt to refresh
      
      if (isRefreshing) {
        // If already refreshing, wait for the refresh to complete
        return new Promise<InternalAxiosRequestConfig>((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshedTokens = await refreshAccessToken(accessToken, refreshToken);
        
        if (refreshedTokens) {
          // Update session with new tokens
          await updateSessionTokens(refreshedTokens.token, refreshedTokens.refresh_token);
          
          // Update current request with new token
          accessToken = refreshedTokens.token;
          
          // Notify all waiting requests
          onRefreshed(refreshedTokens.token);
        } else {
          // Refresh failed, sign out user
          // eslint-disable-next-line no-console
          console.error("Token refresh failed. Signing out...");
          await signOut({ redirect: true, callbackUrl: "/login" });
          return config;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error during token refresh:", error);
        await signOut({ redirect: true, callbackUrl: "/login" });
        return config;
      } finally {
        isRefreshing = false;
      }
    }

    // Add the (verified or refreshed) token to the request
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to process auth token:", error);
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

  // Helper function to extract error message from backend response
  const getBackendErrorMessage = (): string | null => {
    if (responseData?.error) return responseData.error as string;
    if (responseData?.message) return responseData.message as string;
    if (responseData?.detail) return responseData.detail as string;
    return null;
  };

  // Handle 401 Unauthorized - token might be expired
  if (status === 401 && error.config) {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Prevent infinite retry loops
    if (!originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { accessToken, refreshToken } = await getTokens();
        
        if (accessToken && refreshToken) {
          const refreshedTokens = await refreshAccessToken(accessToken, refreshToken);
          
          if (refreshedTokens) {
            // Update session with new tokens
            await updateSessionTokens(refreshedTokens.token, refreshedTokens.refresh_token);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshedTokens.token}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // eslint-disable-next-line no-console
        console.error("Failed to refresh token on 401:", refreshError);
        // Sign out if refresh fails
        await signOut({ redirect: true, callbackUrl: "/login" });
        return Promise.reject(error);
      }
    }
    
    // Use backend error message if available, otherwise use default
    error.message = getBackendErrorMessage() || "You are not authorized. Please log in again.";
  }
  // Parse validation errors (422 - Unprocessable Entity)
  else if (status === 422 && responseData?.detail) {
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
