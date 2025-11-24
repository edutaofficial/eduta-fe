/* eslint-disable no-console */
/**
 * 🪄 Token Refresh System - Usage Examples
 * 
 * This file contains practical examples of how the magical token refresh system works.
 * You typically don't need to use these manually - it's all automatic!
 */

import axiosInstance from "@/app/api/axiosInstance";
import { getValidAccessToken, isTokenExpired } from "@/lib/tokenManager";
import { getSession } from "next-auth/react";

// ============================================================================
// EXAMPLE 1: Automatic Usage (Most Common - No Code Needed!)
// ============================================================================

/**
 * All API calls through axiosInstance automatically benefit from token refresh!
 * You don't need to do anything special.
 */
export async function automaticExample() {
  try {
    // This will automatically:
    // 1. Check if token is expired before request
    // 2. Refresh token if needed
    // 3. Retry if 401 occurs
    // 4. Return response seamlessly
    const response = await axiosInstance.get("/api/v1/courses");
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Manual Token Validation
// ============================================================================

/**
 * Check if current token is expired (useful for debugging)
 */
export async function checkTokenStatus() {
  const session = await getSession();
  const token = (session as { accessToken?: string })?.accessToken;
  
  if (!token) {
    console.log("❌ No token found - user needs to login");
    return { hasToken: false, isExpired: null };
  }
  
  const expired = isTokenExpired(token);
  
  if (expired) {
    console.log("⏰ Token is expired or will expire soon");
  } else {
    console.log("✅ Token is valid");
  }
  
  return { hasToken: true, isExpired: expired };
}

// ============================================================================
// EXAMPLE 3: Get Valid Token for Custom Use
// ============================================================================

/**
 * Get a valid access token (automatically refreshes if needed)
 * Useful when you need to make a custom API call outside of axiosInstance
 */
export async function customAPICallExample() {
  // Get valid token (will refresh if expired)
  const token = await getValidAccessToken();
  
  if (!token) {
    console.error("❌ Failed to get valid token");
    return null;
  }
  
  // Use the token in your custom API call
  try {
    const response = await fetch("https://some-external-api.com/data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error in custom API call:", error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Multiple Simultaneous Requests
// ============================================================================

/**
 * Make multiple API calls at once - token refresh is handled efficiently!
 * Only one refresh operation happens, all requests wait and use the new token
 */
export async function multipleConcurrentRequests() {
  try {
    const [courses, profile, enrollments] = await Promise.all([
      axiosInstance.get("/api/v1/courses"),
      axiosInstance.get("/api/v1/user/profile"),
      axiosInstance.get("/api/v1/user/enrollments"),
    ]);
    
    // All three requests will:
    // 1. Detect expired token
    // 2. First one triggers refresh
    // 3. Others wait in queue
    // 4. All proceed with new token
    // 5. Return data successfully
    
    return {
      courses: courses.data,
      profile: profile.data,
      enrollments: enrollments.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: React Component Usage
// ============================================================================

/**
 * Example React component using automatic token refresh
 */
/*
export function CourseListComponent() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        
        // Token refresh happens automatically in the background
        // User never sees any loading states related to token refresh
        const response = await axiosInstance.get("/api/v1/courses");
        
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        // If refresh failed, user will be redirected to login automatically
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourses();
  }, []);
  
  if (loading) return <div>Loading courses...</div>;
  
  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 6: React Query with Automatic Token Refresh
// ============================================================================

/**
 * React Query hooks work seamlessly with automatic token refresh
 */
/*
export function useCoursesWithAutoRefresh() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      // Token refresh happens automatically!
      const response = await axiosInstance.get("/api/v1/courses");
      return response.data;
    },
    // If token refresh fails, React Query will handle the error
    retry: 1,
  });
}
*/

// ============================================================================
// EXAMPLE 7: Form Submission with Token Refresh
// ============================================================================

/**
 * Submit form data - token refresh is automatic
 */
export async function submitCourseForm(courseData: unknown) {
  try {
    // Even if user spent 30 minutes filling the form and token expired,
    // it will automatically refresh and submit successfully!
    const response = await axiosInstance.post("/api/v1/courses", courseData);
    
    console.log("✅ Course created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create course:", error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 8: File Upload with Token Refresh
// ============================================================================

/**
 * Upload files - token refresh works here too!
 */
export async function uploadCourseVideo(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    // Large file uploads can take time, token might expire during upload
    // But it's handled automatically!
    const response = await axiosInstance.post("/api/v1/upload/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 9: WebSocket Connection (Advanced)
// ============================================================================

/**
 * Get valid token for WebSocket connection
 */
export async function connectWebSocket() {
  // Get a fresh, valid token for WebSocket
  const token = await getValidAccessToken();
  
  if (!token) {
    console.error("Cannot connect to WebSocket without valid token");
    return null;
  }
  
  // Connect to WebSocket with valid token
  const ws = new WebSocket(`wss://api.example.com/ws?token=${token}`);
  
  ws.onopen = () => {
    console.log("✅ WebSocket connected");
  };
  
  ws.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
  };
  
  return ws;
}

// ============================================================================
// EXAMPLE 10: Debugging Token Issues
// ============================================================================

/**
 * Debug function to inspect token details
 */
export async function debugTokenInfo() {
  const session = await getSession();
  const token = (session as { accessToken?: string })?.accessToken;
  
  if (!token) {
    console.log("No token in session");
    return;
  }
  
  // Decode token (without verification)
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    
    const issuedAt = new Date(payload.iat * 1000);
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeft / 1000 / 60);
    
    console.log("=== TOKEN INFO ===");
    console.log("Issued at:", issuedAt.toLocaleString());
    console.log("Expires at:", expiresAt.toLocaleString());
    console.log("Time left:", minutesLeft, "minutes");
    console.log("Is expired?", isTokenExpired(token));
    console.log("Payload:", payload);
    console.log("==================");
    
    return {
      issuedAt,
      expiresAt,
      minutesLeft,
      isExpired: isTokenExpired(token),
      payload,
    };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * 🎯 KEY TAKEAWAYS:
 * 
 * 1. You DON'T need to manually handle token refresh in your code
 * 2. Just use axiosInstance for API calls - it's all automatic!
 * 3. Token refresh happens silently in the background
 * 4. Multiple simultaneous requests are handled efficiently
 * 5. If refresh fails, user is automatically redirected to login
 * 
 * 🪄 The system is truly MAGICAL - it just works!
 */

