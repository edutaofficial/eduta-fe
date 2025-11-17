// lib/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
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
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Base URL
// const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL = "http://13.56.12.137:3005";

// Decode JWT to extract instructor_id and learner_id
function decodeJwt(token: string): {
  instructor_id?: number;
  learner_id?: number;
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
  const { data: session } = useSession();
  const [isLoading] = useState(false);

  // Extract user data from session
  const user: User | null = session?.user
    ? (() => {
        const token = (session as unknown as { accessToken?: string })
          .accessToken;
        const decoded = token ? decodeJwt(token) : null;

        return {
          id: (session.user as unknown as { id?: string })?.id,
          email: session.user.email || "",
          name: session.user.name || "User",
          role: ((session as unknown as { role?: UserRole }).role ||
            "student") as UserRole,
          token,
          instructorId: decoded?.instructor_id,
          learnerId: decoded?.learner_id,
        };
      })()
    : null;

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

      const response = await fetch(`${API_BASE_URL}/api/v1/user`, {
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
    nextAuthSignOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
