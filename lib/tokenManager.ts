/**
 * Token Manager - Magical Token Refresh Utility
 * 
 * Handles automatic token verification, refresh, and session updates
 * Works silently in the background without user intervention
 */

import { getSession,  signOut } from "next-auth/react";

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
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 5 * 60; // 5 minutes buffer
  
  return decoded.exp < currentTime + bufferTime;
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
 */
export async function magicalTokenRefresh(): Promise<string | null> {
  try {
    // Get current session
    const session = await getSession();
    
    if (!session) {
      console.error("No session found");
      return null;
    }

    // Get refresh token from session
    const refreshToken = (session as unknown as { refreshToken?: string })?.refreshToken;
    
    if (!refreshToken) {
      console.error("No refresh token found in session");
      // If no refresh token, user needs to login again
      await signOut({ redirect: true, callbackUrl: "/login" });
      return null;
    }

    // If already refreshing, wait for it to complete
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    isRefreshing = true;

    // Call refresh token API using native fetch to avoid circular dependency with axios
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://13.56.12.137:3005";
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
      throw new Error("Token refresh API request failed");
    }

    const data = await response.json();
    const newAccessToken = data.token || data.access_token;
    const newRefreshToken = data.refresh_token;

    if (!newAccessToken) {
      throw new Error("No access token received from refresh");
    }

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
    console.error("Token refresh failed:", error);
    
    // If refresh fails, user needs to login again
    await signOut({ redirect: true, callbackUrl: "/login" });
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

