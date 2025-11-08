/**
 * API Configuration
 * Single source of truth for API base URL
 */

export const API_CONFIG = {
  // Primary base URL - endpoints specify their own paths including version
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://54.183.140.154:3005",
  
  // Timeout configurations
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 0, // No timeout for uploads
} as const;

/**
 * Get base URL
 * Each API function specifies its own full path (e.g., /api/v1/user/login)
 */
export function getBaseUrl(): string {
  return API_CONFIG.BASE_URL;
}

