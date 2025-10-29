// middleware.ts (place in root directory, same level as app folder)
import { NextResponse, type NextRequest } from "next/server";

/**
 * Authentication & Authorization Middleware
 * 
 * This middleware runs on EVERY request before reaching the page
 * It handles:
 * 1. Authentication verification
 * 2. Role-based authorization
 * 3. Automatic redirects based on auth state
 * 
 * 🔴 FOR PRODUCTION: Replace cookie-based auth with JWT verification
 */

interface User {
  email: string;
  role: "student" | "instructor" | "admin";
  name: string;
  id?: string;
  token?: string;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth cookie
  const authCookie = request.cookies.get("eduta_auth_user");
  
  // Parse user from cookie
  let user: User | null = null;
  if (authCookie) {
    try {
      user = JSON.parse(decodeURIComponent(authCookie.value));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse auth cookie:", error);
      // Clear invalid cookie
      const response = NextResponse.next();
      response.cookies.delete("eduta_auth_user");
      return response;
    }
  }

  /**
   * 🔴 FOR PRODUCTION: Verify JWT token here
   * 
   * Instead of reading from cookie directly, you should:
   * 1. Extract token from cookie or Authorization header
   * 2. Verify token signature with your secret key
   * 3. Check token expiration
   * 4. Decode user data from token payload
   * 
   * Example with jose library:
   * 
   * import { jwtVerify } from 'jose';
   * 
   * const token = request.cookies.get('auth_token')?.value;
   * if (token) {
   *   try {
   *     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
   *     const { payload } = await jwtVerify(token, secret);
   *     user = payload as User;
   *   } catch (error) {
   *     // Token invalid or expired
   *     user = null;
   *   }
   * }
   */

  // Define protected routes and their allowed roles
  const protectedRoutes: Record<string, ("student" | "instructor" | "admin")[]> = {
    "/student": ["student"],
    "/instructor": ["instructor"],
    "/admin": ["admin"],
  };

  // Public routes that should redirect to dashboard if already logged in
  // Include real routes used in app
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/"];

  // Check if current path matches a protected route
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  // --- SCENARIO 1: User is logged in and accessing public routes ---
  if (user && publicRoutes.includes(pathname)) {
    const roleRoutes: Record<string, string> = {
      student: "/student/dashboard",
      instructor: "/instructor/dashboard",
      admin: "/admin",
    };
    
    const dashboardUrl = new URL(roleRoutes[user.role] || "/login", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // --- SCENARIO 2: Accessing a protected route ---
  if (protectedRoute) {
    // Not authenticated - redirect to login with return URL
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated but wrong role - redirect to appropriate dashboard
    const allowedRoles = protectedRoutes[protectedRoute];
    if (!allowedRoles.includes(user.role)) {
      const roleRoutes: Record<string, string> = {
        student: "/student/dashboard",
        instructor: "/instructor/dashboard",
        admin: "/admin",
      };
      
      const dashboardUrl = new URL(roleRoutes[user.role] || "/login", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // --- SCENARIO 3: Valid access - allow request to proceed ---
  return NextResponse.next();
}

/**
 * Matcher configuration
 * 
 * This tells Next.js which routes should be processed by the middleware
 * We exclude:
 * - API routes (/api/*)
 * - Static files (/_next/static/*)
 * - Image optimization (/_next/image/*)
 * - Favicon
 * - Public folder files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (e.g., images, fonts)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/**
 * 📝 IMPORTANT NOTES:
 * 
 * 1. FILE LOCATION: This file MUST be in the root directory (same level as app/ folder)
 * 
 * 2. COOKIE vs TOKEN:
 *    - Current: Uses cookie with user data (NOT SECURE for production)
 *    - Production: Should use httpOnly cookie with JWT token
 * 
 * 3. SECURITY CHECKLIST FOR PRODUCTION:
 *    ✅ Use JWT tokens instead of storing user data in cookies
 *    ✅ Use httpOnly, secure, sameSite cookies
 *    ✅ Implement token refresh mechanism
 *    ✅ Add rate limiting
 *    ✅ Validate token signature and expiration
 *    ✅ Use HTTPS in production
 *    ✅ Implement CSRF protection
 * 
 * 4. EDGE RUNTIME:
 *    - This middleware runs on Edge Runtime (not Node.js)
 *    - Cannot use Node.js-specific APIs
 *    - Keep it lightweight and fast
 *    - For heavy operations, use API routes instead
 * 
 * 5. TESTING:
 *    - Test all protected routes
 *    - Test role-based access (student accessing /instructor/*, etc.)
 *    - Test public route redirects when logged in
 *    - Test invalid/expired tokens (in production)
 */