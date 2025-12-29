/**
 * Token Manager - Magical Token Refresh Utility
 * 
 * Handles automatic token verification, refresh, and session updates
 * Works silently in the background without user intervention
 */

import { getSession } from "next-auth/react";

// Track if a refresh is already in progress to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Add a callback to be executed when token refresh completes
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Execute all pending callbacks with the new token
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Decode JWT token (without verification - just to read payload)
 */
function decodeJWT(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Use Buffer for Node and atob for browser
    const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? atob(base64Payload)
        : Buffer.from(base64Payload, "base64").toString("utf-8");

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  // If we cannot read exp, assume not expired to avoid premature sign-outs;
  // backend will reject truly invalid tokens.
  if (!decoded || typeof decoded.exp !== "number") return false;

  const currentTime = Math.floor(Date.now() / 1000);
  // Only expire when the backend-expiry is reached (no aggressive buffer)
  return decoded.exp <= currentTime;
}

/**
 * 🪄 MAGICAL FUNCTION - Automatically refresh token and update session
 * 
 * This function:
 * 1. Gets current session
 * 2. Checks if refresh token exists
 * 3. Calls refresh token API
 * 4. Updates NextAuth session with new tokens
 * 5. Returns new access token
 * 
 * @returns Promise<string | null> - New access token or null if refresh failed
 * 
 * NOTE: This function does NOT automatically sign out the user.
 * It returns null if refresh fails, and the caller should decide whether to sign out.
 */
export async function magicalTokenRefresh(): Promise<string | null> {
  try {
    // Get current session
    const session = await getSession();
    
    if (!session) {
      // eslint-disable-next-line no-console
      console.error("[TokenRefresh] No session found");
      return null;
    }

    // Get refresh token from session
    const refreshToken = (session as unknown as { refreshToken?: string })?.refreshToken;
    
    if (!refreshToken) {
      // eslint-disable-next-line no-console
      console.error("[TokenRefresh] No refresh token found in session");
      // Return null but don't sign out - let the caller decide
      return null;
    }

    // If already refreshing, wait for it to complete
    if (isRefreshing) {
      // eslint-disable-next-line no-console
      console.log("[TokenRefresh] Already refreshing, waiting for completion...");
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    isRefreshing = true;
    // eslint-disable-next-line no-console
    console.log("[TokenRefresh] Starting token refresh...");

    // Call refresh token API using native fetch to avoid circular dependency with axios
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // eslint-disable-next-line no-console
      console.error("[TokenRefresh] API request failed:", response.status, errorData);
      throw new Error(`Token refresh API request failed: ${response.status}`);
    }

    const data = await response.json();
    const newAccessToken = data.token || data.access_token;
    const newRefreshToken = data.refresh_token;

    if (!newAccessToken) {
      throw new Error("No access token received from refresh");
    }

    // eslint-disable-next-line no-console
    console.log("[TokenRefresh] ✅ Token refresh successful");

    // Update session using sessionStorage for immediate availability
    // This ensures next request uses new token while session updates in background
    if (typeof window !== "undefined") {
      sessionStorage.setItem("_refresh_access_token", newAccessToken);
      sessionStorage.setItem("_refresh_refresh_token", newRefreshToken);

      // Dispatch custom event for session update
      const event = new CustomEvent("session", {
        detail: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
      window.dispatchEvent(event);

      // Also trigger NextAuth session update to persist tokens
      // This will call the jwt callback with trigger: "update"
      if (typeof window !== "undefined" && (window as Window & { __NEXT_AUTH_SESSION_TOKEN__?: string }).__NEXT_AUTH_SESSION_TOKEN__) {
        // Trigger session update by dispatching the event that NextAuth listens to
        const updateEvent = new StorageEvent("storage", {
          key: "nextauth.message",
          newValue: JSON.stringify({
            event: "session",
            data: { trigger: "getSession" }
          })
        });
        window.dispatchEvent(updateEvent);
      }

      // Clear temporary tokens after session updates
      setTimeout(() => {
        sessionStorage.removeItem("_refresh_access_token");
        sessionStorage.removeItem("_refresh_refresh_token");
      }, 5000);
    }
    
    isRefreshing = false;
    onTokenRefreshed(newAccessToken);

    return newAccessToken;
  } catch (error) {
    isRefreshing = false;
    // eslint-disable-next-line no-console
    console.error("[TokenRefresh] ❌ Token refresh failed:", error);
    
    // Return null but don't sign out automatically
    // Let the caller (axios interceptor or component) decide what to do
    return null;
  }
}

/**
 * Verify token and refresh if needed
 * 
 * @param token - Current access token
 * @returns Promise<string | null> - Valid token (original or refreshed)
 */
export async function verifyAndRefreshToken(token: string): Promise<string | null> {
  // Check if token is expired
  if (isTokenExpired(token)) {
    // eslint-disable-next-line no-console
    console.log("Token expired, refreshing...");
    return await magicalTokenRefresh();
  }
  
  // Token is still valid
  return token;
}

/**
 * Get valid access token (refresh if needed)
 * This is a convenience function for use in components
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  
  if (!accessToken) {
    return null;
  }

  return await verifyAndRefreshToken(accessToken);
}

