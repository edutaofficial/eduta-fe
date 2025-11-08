import type { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an Axios error or any error object.
 * Handles various API error response formats.
 */
export function extractErrorMessage(error: unknown): string {
  // If it's already a string, return it
  if (typeof error === "string") {
    return error;
  }

  // If it's an Error object, check if it has a response (Axios error)
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      errors?: Array<{ field?: string; message?: string } | string>;
      data?: {
        message?: string;
        error?: string;
      };
    }>;

    // Check if it's an Axios error with a response
    if (axiosError.response?.data) {
      const { data } = axiosError.response;

      // Priority 1: Check for message in data
      if (data.message && typeof data.message === "string") {
        return data.message;
      }

      // Priority 2: Check for error in data
      if (data.error && typeof data.error === "string") {
        return data.error;
      }

      // Priority 3: Check for nested data.message
      if (data.data?.message && typeof data.data.message === "string") {
        return data.data.message;
      }

      // Priority 4: Check for errors array (validation errors)
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const firstError = data.errors[0];
        if (typeof firstError === "string") {
          return firstError;
        }
        if (typeof firstError === "object" && firstError?.message) {
          return firstError.message;
        }
        if (typeof firstError === "object" && firstError?.field && firstError?.message) {
          return `${firstError.field}: ${firstError.message}`;
        }
      }

      // Priority 5: Use status text if available
      if (axiosError.response.statusText) {
        return `${axiosError.response.status} ${axiosError.response.statusText}`;
      }
    }

    // If it's a regular Error with a message, use it
    if (error.message) {
      return error.message;
    }
  }

  // Fallback messages based on error type
  if (error && typeof error === "object") {
    const { message, error: errorField } = error as Record<string, unknown>;
    
    // Try common error message fields
    if (message && typeof message === "string") {
      return message;
    }
    if (errorField && typeof errorField === "string") {
      return errorField;
    }
  }

  // Ultimate fallback
  return "An unexpected error occurred. Please try again.";
}

/**
 * Checks if an error is a network error (CORS, connectivity, etc.)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const axiosError = error as AxiosError;
    return (
      axiosError.code === "ERR_NETWORK" ||
      axiosError.message === "Network Error" ||
      (!axiosError.response && axiosError.request)
    );
  }
  return false;
}

/**
 * Gets a user-friendly network error message
 */
export function getNetworkErrorMessage(): string {
  return "Network error. Please check your internet connection and try again.";
}

