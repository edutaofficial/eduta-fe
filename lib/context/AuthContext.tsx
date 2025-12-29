// lib/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

export type UserRole = "student" | "instructor" | "admin";

export interface User {
  email: string;
  role: UserRole;
  name: string;
  id?: string;
  token?: string;
  instructorId?: number;
  learnerId?: number;
  profilePictureUrl?: string;
}

// JWT payload typing not required with next-auth session callbacks

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    role: UserRole,
    name: string,
    options?: { professionalTitle?: string; bio?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfilePictureUrl: (url: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base URL
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

// LocalStorage key for profile picture override
const PROFILE_PICTURE_STORAGE_KEY = "eduta_profile_picture_override";


// Decode JWT to extract instructor_id, learner_id, and profile_picture_url
function decodeJwt(token: string): {
  instructor_id?: number;
  learner_id?: number;
  profile_picture_url?: string;
  [key: string]: unknown;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update: updateSession, status } = useSession();
  const isLoading = status === "loading";
  const [profilePictureOverride, setProfilePictureOverride] = useState<string | null>(null);
  const [profilePictureVersion, setProfilePictureVersion] = useState<number>(0);

  // Load profile picture override from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && session?.user) {
      const stored = localStorage.getItem(PROFILE_PICTURE_STORAGE_KEY);
      const token = (session as unknown as { accessToken?: string }).accessToken;
      const decoded = token ? decodeJwt(token) : null;
      const sessionProfilePic = decoded?.profile_picture_url as string | undefined;

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only use stored value if it's a valid string
          if (typeof parsed === "string" && parsed.length > 0) {
            // If session has a profile picture and it's different from stored,
            // it means the backend was updated (e.g., user logged in again),
            // so we should use the session value and clear localStorage
            if (sessionProfilePic && sessionProfilePic !== parsed) {
              localStorage.removeItem(PROFILE_PICTURE_STORAGE_KEY);
            }
            // Compute value to set: null if session pic differs, otherwise parsed value
            const valueToSet = (sessionProfilePic && sessionProfilePic !== parsed) ? null : parsed;
            // Set state once after computing the value
            // This is a legitimate use case: syncing React state with localStorage (external system)
            setProfilePictureOverride(valueToSet); // eslint-disable-line react-hooks/set-state-in-effect
          }
        } catch {
          // Invalid JSON, clear it
          localStorage.removeItem(PROFILE_PICTURE_STORAGE_KEY);
        }
      }
    }
  }, [session]);

  // Extract user data from session - use useMemo to ensure proper reactivity
  const user: User | null = React.useMemo(() => {
    if (!session?.user) return null;
    
    const token = (session as unknown as { accessToken?: string })
      .accessToken;
    const decoded = token ? decodeJwt(token) : null;

    // Priority: override (from state/localStorage) > decoded token > undefined
    let profilePicUrl = profilePictureOverride || (decoded?.profile_picture_url as string | undefined);
    
    // Add cache-busting parameter to force browser to reload image when URL changes
    // Use version number instead of timestamp to avoid regenerating on every render
    if (profilePicUrl && profilePictureVersion > 0) {
      const separator = profilePicUrl.includes("?") ? "&" : "?";
      profilePicUrl = `${profilePicUrl}${separator}_v=${profilePictureVersion}`;
    }

    return {
      id: (session.user as unknown as { id?: string })?.id,
      email: session.user.email || "",
      name: session.user.name || "User",
      role: ((session as unknown as { role?: UserRole }).role ||
        "student") as UserRole,
      token,
      instructorId: decoded?.instructor_id,
      learnerId: decoded?.learner_id,
      profilePictureUrl: profilePicUrl,
    };
  }, [session, profilePictureOverride, profilePictureVersion]);

  // (jwt decode not needed; next-auth provides data via session callbacks)

  type ApiJson = { [key: string]: unknown };
  async function parseResponseSafe(response: Response): Promise<ApiJson> {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    const text = await response.text();
    try {
      return JSON.parse(text) as ApiJson;
    } catch {
      return { message: text } as ApiJson;
    }
  }

  /**
   * LOGIN FUNCTION - Real API integration
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await nextAuthSignIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (res?.error) return { success: false, error: res.error };
      return { success: true };

      /* 🟢 REAL API IMPLEMENTATION EXAMPLE:
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      
      // Set cookie for middleware
      document.cookie = `eduta_auth_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400`;

      const roleRoutes: Record<UserRole, string> = {
        student: '/student/dashboard',
        instructor: '/instructor/dashboard',
        admin: '/admin',
      };

      router.push(roleRoutes[data.user.role]);

      return { success: true };
      */
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Login error:", error);
      return {
        success: false,
        error: "Something went wrong. Please try again.",
      };
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    name: string,
    options?: { professionalTitle?: string; bio?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const [firstName, ...rest] = name.trim().split(" ");
      const lastName = rest.join(" ");
      const user_type = role === "instructor" ? "instructor" : "learner";

      const response = await fetch(`${API_BASE_URL}api/v1/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: firstName || name,
          last_name: lastName || "",
          email,
          password,
          confirm_password: password,
          user_type,
          provider: "local", // Explicitly set provider for local signup
          professional_title:
            role === "instructor" ? options?.professionalTitle || "" : "",
          bio: role === "instructor" ? options?.bio || "" : "",
        }),
      });

      const data = (await parseResponseSafe(response)) as {
        status?: string;
        message?: string;
        error_code?: string;
      };

      if (!response.ok || data?.status !== "success") {
        const message =
          data?.message ||
          (data?.error_code === "USER__DUPLICATE_EMAIL_OR_NICKNAME"
            ? "duplicate email or nickname"
            : "Signup failed");
        return { success: false, error: String(message) };
      }

      // After signup, sign in using NextAuth credentials
      await nextAuthSignIn("credentials", { redirect: false, email, password });
      return { success: true };

      /* 🟢 REAL API IMPLEMENTATION EXAMPLE:
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Signup failed' };
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      
      document.cookie = `eduta_auth_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400`;

      const roleRoutes: Record<UserRole, string> = {
        student: '/student/dashboard',
        instructor: '/instructor/dashboard',
        admin: '/admin',
      };

      router.push(roleRoutes[data.user.role]);

      return { success: true };
      */
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Signup error:", error);
      return { success: false, error: "An error occurred during signup" };
    }
  };

  /**
   * LOGOUT FUNCTION
   *
   * 🔴 OPTIONALLY ADD API CALL TO INVALIDATE TOKEN ON SERVER
   *
   * API Endpoint: POST /api/auth/logout
   * Request Headers: { Authorization: `Bearer ${token}` }
   */
  const logout = () => {
    setProfilePictureOverride(null); // Clear override on logout
    // Clear localStorage on logout
    if (typeof window !== "undefined") {
      localStorage.removeItem(PROFILE_PICTURE_STORAGE_KEY);
    }
    // Use relative URL to preserve current environment (localhost/production)
    nextAuthSignOut({ 
      redirect: true, 
      callbackUrl: `${window.location.origin}/login` 
    });
  };

  const updateProfilePictureUrl = async (url: string) => {
    // Increment version to force cache busting
    setProfilePictureVersion((prev) => prev + 1);
    
    // Update state immediately for instant UI feedback
    setProfilePictureOverride(url);
    
    // Persist to localStorage so it survives page reloads
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PROFILE_PICTURE_STORAGE_KEY, JSON.stringify(url));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to save profile picture to localStorage:", error);
      }
    }

    // Try to update the session (this will trigger a session refresh)
    // Note: The JWT token itself won't be updated until next login,
    // but we can update the session object
    try {
      await updateSession({
        profilePictureUrl: url,
      });
    } catch (error) {
      // Session update is optional - localStorage will handle persistence
      // eslint-disable-next-line no-console
      console.warn("Failed to update session with new profile picture:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfilePictureUrl, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * 🔴 HELPER FUNCTION FOR AUTHENTICATED API CALLS
 *
 * Use this in your components to make authenticated requests
 *
 * Example usage:
 *
 * const { user } = useAuth();
 * const data = await authenticatedFetch('/api/courses', {
 *   method: 'GET',
 * }, user?.token);
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  token?: string
) {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}
