// middleware.ts (place in root directory, same level as app folder)
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read NextAuth JWT (App Router)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const user: User | null = token
    ? {
        email: (token as unknown as { email?: string }).email || "",
        role: (token as unknown as { role?: User["role"] }).role || "student",
        name: (token as unknown as { name?: string }).name || "User",
        id: (token as unknown as { sub?: string }).sub,
      }
    : null;

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
  };

  // Auth-only routes that should redirect to dashboard if already logged in
  // These are pages like login/signup that don't make sense for logged-in users
  const authOnlyRoutes = ["/login", "/signup", "/forgot-password"];

  // Check if current path matches a protected route
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  // --- SCENARIO 1: User is logged in and accessing auth-only routes ---
  // Redirect logged-in users away from login/signup pages
  if (user && authOnlyRoutes.includes(pathname)) {
    const roleRoutes: Record<string, string> = {
      student: "/student/courses",
      instructor: "/instructor/courses",
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
        instructor: "/instructor/courses",
        admin: "/admin",
      };
      
      const dashboardUrl = new URL(roleRoutes[user.role] || "/login", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // --- SCENARIO 2b: Additional RBAC enforcement beyond protected prefixes ---
  if (user) {
    // Instructor can only access /instructor/* routes (and public routes like home, courses, blog)
    // Block instructors from accessing /student/* routes
    if (user.role === "instructor" && pathname.startsWith("/student")) {
      const dashboardUrl = new URL("/instructor/courses", request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Student can access everything EXCEPT /instructor/* routes
    // Allow: /, /courses/*, /blog/*, /all-courses/*, /learn/*, /student/*, etc.
    if (user.role === "student" && pathname.startsWith("/instructor")) {
      const dashboardUrl = new URL("/student/courses", request.url);
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
 * 2. ACCESS CONTROL RULES:
 *    - Students: Can access ALL routes EXCEPT /instructor/*
 *      ✅ /, /courses/*, /blog/*, /all-courses/*, /learn/*, /student/*
 *      ❌ /instructor/*
 *    - Instructors: Can access public routes and /instructor/*
 *      ✅ /, /courses/*, /blog/*, /all-courses/*, /instructor/*
 *      ❌ /student/*
 *    - Logged-in users: Cannot access /login, /signup, /forgot-password
 * 
 * 3. COOKIE vs TOKEN:
 *    - Current: Uses NextAuth JWT (secure)
 *    - Production: Already using proper JWT with httpOnly cookies
 * 
 * 4. SECURITY CHECKLIST FOR PRODUCTION:
 *    ✅ Use JWT tokens with NextAuth
 *    ✅ Use httpOnly, secure, sameSite cookies
 *    ✅ Implement token refresh mechanism
 *    ✅ Add rate limiting
 *    ✅ Validate token signature and expiration
 *    ✅ Use HTTPS in production
 *    ✅ Implement CSRF protection
 * 
 * 5. EDGE RUNTIME:
 *    - This middleware runs on Edge Runtime (not Node.js)
 *    - Cannot use Node.js-specific APIs
 *    - Keep it lightweight and fast
 *    - For heavy operations, use API routes instead
 * 
 * 6. TESTING:
 *    - Test all protected routes
 *    - Test student accessing public pages (/, /courses/*)
 *    - Test student blocked from /instructor/*
 *    - Test instructor blocked from /student/*
 *    - Test logged-in users redirected from /login
 *    - Test invalid/expired tokens (in production)
 */