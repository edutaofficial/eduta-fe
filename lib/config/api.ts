/**
 * API Configuration
 * Single source of truth for API base URL
 */

export const API_CONFIG = {
  // Primary base URL - endpoints specify their own paths including version
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  
  // Timeout configurations
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 0, // No timeout for uploads
} as const;

/**
 * Get base URL
 * Each API function specifies its own full path (e.g., /api/v1/user/login)
 * Normalizes trailing slashes to prevent double slashes in URLs
 */
export function getBaseUrl(): string {
  if (!API_CONFIG.BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not defined");
  }
  // Remove trailing slashes to prevent double slashes when combining with paths
  return API_CONFIG.BASE_URL.replace(/\/+$/, "");
}

