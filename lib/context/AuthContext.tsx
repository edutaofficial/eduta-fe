// lib/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "student" | "instructor" | "admin";

export interface User {
  email: string;
  role: UserRole;
  name: string;
  id?: string;
  token?: string;
}

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
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (for development only)
// Password requirements: at least 12 characters, uppercase, lowercase, numbers
const MOCK_USERS = [
  {
    email: "student@eduta.org",
    password: "StudentPassword123",
    role: "student" as UserRole,
    name: "Student User",
  },
  {
    email: "instructor@eduta.org",
    password: "InstructorPass123",
    role: "instructor" as UserRole,
    name: "Instructor User",
  },
  {
    email: "admin@eduta.org",
    password: "AdminPassword123",
    role: "admin" as UserRole,
    name: "Admin User",
  },
];

const AUTH_STORAGE_KEY = "eduta_auth_user";
const AUTH_TOKEN_KEY = "eduta_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization to load user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return { ...parsedUser, token: storedToken };
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    return null;
  });
  const [isLoading] = useState(false);
  const router = useRouter();

  // Set cookie for middleware after mount if user exists
  useEffect(() => {
    if (user) {
      const userString = JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
      document.cookie = `eduta_auth_user=${encodeURIComponent(userString)}; path=/; max-age=86400`; // 24 hours
    }
  }, [user]);

  /**
   * LOGIN FUNCTION
   *
   * 🔴 REPLACE THIS WITH REAL API CALL
   *
   * API Endpoint: POST /api/auth/login
   * Request Body: { email: string, password: string }
   * Expected Response: {
   *   success: boolean,
   *   user: { id, email, name, role },
   *   token: string,
   *   error?: string
   * }
   *
   * Example implementation:
   *
   * const response = await fetch('/api/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email, password }),
   * });
   * const data = await response.json();
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 🔴 MOCK IMPLEMENTATION - REPLACE WITH REAL API CALL
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      const foundUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        return { success: false, error: "Invalid email or password" };
      }

      // Simulate token generation (in real app, this comes from backend)
      const mockToken = `mock_token_${Date.now()}`;

      const userData: User = {
        id: `user_${Date.now()}`, // In real app, this comes from backend
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name,
        token: mockToken,
      };

      // Store user data
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);

      // Set cookie for middleware
      document.cookie = `eduta_auth_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400`;

      // Route based on role
      const roleRoutes: Record<UserRole, string> = {
        student: "/student/dashboard",
        instructor: "/instructor/dashboard",
        admin: "/admin",
      };

      router.push(roleRoutes[foundUser.role]);

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
      return { success: false, error: "An error occurred during login" };
    }
  };

  /**
   * SIGNUP FUNCTION
   *
   * 🔴 REPLACE THIS WITH REAL API CALL
   *
   * API Endpoint: POST /api/auth/signup
   * Request Body: { email: string, password: string, role: UserRole, name: string }
   * Expected Response: {
   *   success: boolean,
   *   user: { id, email, name, role },
   *   token: string,
   *   error?: string
   * }
   */
  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 🔴 MOCK IMPLEMENTATION - REPLACE WITH REAL API CALL
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      // Check if user already exists
      const existingUser = MOCK_USERS.find((u) => u.email === email);
      if (existingUser) {
        return { success: false, error: "User already exists" };
      }

      // Simulate token generation
      const mockToken = `mock_token_${Date.now()}`;

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        role,
        name,
        token: mockToken,
      };

      // Add to mock database (won't persist on refresh in this demo)
      MOCK_USERS.push({ email, password, role, name });

      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(AUTH_TOKEN_KEY, mockToken);

      // Set cookie for middleware
      document.cookie = `eduta_auth_user=${encodeURIComponent(JSON.stringify(newUser))}; path=/; max-age=86400`;

      // Route based on role
      const roleRoutes: Record<UserRole, string> = {
        student: "/student/dashboard",
        instructor: "/instructor/dashboard",
        admin: "/admin",
      };

      router.push(roleRoutes[role]);

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
    // 🟢 OPTIONAL: Call logout API to invalidate token on server
    // await fetch('/api/auth/logout', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${user?.token}` },
    //   credentials: 'include',
    // });

    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);

    // Clear cookie
    document.cookie =
      "eduta_auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    router.push("/login");
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
