import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { loginUser } from "@/app/api/auth/login";
import { signupUser } from "@/app/api/auth/signup";

/**
 * Decode JWT payload to extract user information
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Handle OAuth user authentication (Google/Facebook)
 * Tries to login first, if user doesn't exist, creates account
 * @param userType - Optional user type (learner/instructor) from signup page selection
 */
async function handleOAuthUser(
  email: string,
  providerId: string,
  provider: "google" | "facebook",
  name: string,
  userType?: "learner" | "instructor"
): Promise<{ token: string; refresh_token?: string; payload: Record<string, unknown> }> {
  // eslint-disable-next-line no-console
  console.log(`[OAuth] Starting authentication for ${email} via ${provider}`, {
    email,
    provider,
    providerId: `${providerId.substring(0, 10)}...`, // Log partial ID for debugging
    name,
  });

  try {
    // eslint-disable-next-line no-console
    console.log(`[OAuth] Attempting login for existing user: ${email}`);
    
    // Try to login first (user might already exist)
    const loginResponse = await loginUser({
      email,
      provider,
      providerId,
    });

    // eslint-disable-next-line no-console
    console.log(`[OAuth] Login response received for ${email}`, {
      hasToken: !!loginResponse.data.token,
      hasRefreshToken: !!loginResponse.data.refresh_token,
      status: loginResponse.status,
    });

    const { token, refresh_token } = loginResponse.data;
    if (!token) {
      throw new Error("No token received from login");
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      throw new Error("Invalid token received");
    }

    // eslint-disable-next-line no-console
    console.log(`[OAuth] Login successful for ${email}`, {
      userId: payload.user_id,
      userType: payload.user_type,
      email: payload.email,
    });

    return { token, refresh_token, payload };
  } catch (loginError) {
    // Check if error is "user not found" or "email already in use"
    const errorMessage = loginError instanceof Error ? loginError.message : "Unknown error";
    const isUserNotFound = errorMessage.toLowerCase().includes("user not found") || 
                          errorMessage.toLowerCase().includes("failed to login");
    const isEmailInUse = errorMessage.toLowerCase().includes("email is already in use") ||
                        errorMessage.toLowerCase().includes("email already in use");
    
    // If email is already in use, this means user exists but with different provider
    // Throw a helpful error
    if (isEmailInUse) {
      throw new Error(
        "This email is already registered. Please sign in with your email and password, " +
        "or contact support to link your Google account."
      );
    }
    
    // If user not found, proceed with signup
    if (!isUserNotFound) {
      // Some other error occurred, re-throw it
      throw loginError;
    }
    
    // eslint-disable-next-line no-console
    console.log(`[OAuth] Login failed for ${email}, attempting signup`, {
      error: errorMessage,
      provider,
    });

    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ");

    try {
      // eslint-disable-next-line no-console
      console.log(`[OAuth] Creating new account for ${email}`, {
        firstName,
        lastName,
        userType: "learner",
        provider,
      });

      // Create new user via OAuth signup
      // Use userType from signup page selection, default to learner
      const finalUserType = userType || "learner";
      
      // eslint-disable-next-line no-console
      console.log(`[OAuth] Creating account with user_type: ${finalUserType}`);
      
      const signupResponse = await signupUser({
        email,
        first_name: firstName || name,
        last_name: lastName || "",
        user_type: finalUserType,
        provider,
        providerId,
      });

      // eslint-disable-next-line no-console
      console.log(`[OAuth] Signup successful for ${email}`, {
        status: signupResponse.status,
        userId: signupResponse.data?.user_id,
      });

      // eslint-disable-next-line no-console
      console.log(`[OAuth] Attempting login after signup for ${email}`);

      // Now login with the newly created account
      const loginResponse = await loginUser({
        email,
        provider,
        providerId,
      });

      // eslint-disable-next-line no-console
      console.log(`[OAuth] Post-signup login response for ${email}`, {
        hasToken: !!loginResponse.data.token,
        hasRefreshToken: !!loginResponse.data.refresh_token,
        status: loginResponse.status,
      });

      const { token, refresh_token } = loginResponse.data;
      if (!token) {
        throw new Error("No token received after signup");
      }

      const payload = decodeJwtPayload(token);
      if (!payload) {
        throw new Error("Invalid token received after signup");
      }

      // eslint-disable-next-line no-console
      console.log(`[OAuth] Post-signup login successful for ${email}`, {
        userId: payload.user_id,
        userType: payload.user_type,
      });

      return { token, refresh_token, payload };
    } catch (signupError) {
      // eslint-disable-next-line no-console
      console.error(`[OAuth] Signup/login failed for ${email}:`, {
        error: signupError instanceof Error ? signupError.message : "Unknown error",
        stack: signupError instanceof Error ? signupError.stack : undefined,
        provider,
      });
      
      // Check for specific errors
      const errorMessage = signupError instanceof Error ? signupError.message : "Unknown error";
      const isEmailInUse = errorMessage.toLowerCase().includes("email is already in use") ||
                          errorMessage.toLowerCase().includes("email already in use");
      
      if (isEmailInUse) {
        throw new Error(
          "This email is already registered. Please sign in with your email and password, " +
          "or contact support to link your Google account."
        );
      }
      
      // Re-throw with more context
      throw new Error(`OAuth authentication failed: ${errorMessage}`);
    }
  }
}

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-for-local-development-only",
  session: { 
    strategy: "jwt",
    // Match backend token expiry (24 hours)
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Use the centralized login API function with local provider
          const response = await loginUser({
            email: credentials.email,
            password: credentials.password,
            provider: "local",
          });

          const { token, refresh_token } = response.data;
          if (!token) {
            throw new Error("Login failed: No token received from server");
          }

          // Decode JWT to extract user information
          const payload = decodeJwtPayload(token);
          if (!payload) {
            throw new Error("Login failed: Invalid token received");
          }

          const role: "instructor" | "student" = payload.user_type === "instructor" ? "instructor" : "student";
          const name =
            [payload.first_name, payload.last_name]
              .filter(Boolean)
              .join(" ") || "User";

          const userObj: {
            id: string;
            email: string;
            name: string;
            role: "instructor" | "student";
            token: string;
            refreshToken?: string;
          } = {
            id: String(payload.user_id || payload.email || credentials.email),
            email: (payload.email as string) || credentials.email,
            name,
            role,
            token,
            refreshToken: refresh_token,
          };

          return userObj;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Login failed:", error);
          
          // Extract and throw the actual error message from the backend
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          
          throw new Error("Login failed. Please check your credentials and try again.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // eslint-disable-next-line no-console
      console.log("[NextAuth] signIn callback triggered", {
        provider: account?.provider,
        hasProviderAccountId: !!account?.providerAccountId,
        userEmail: user.email,
        userName: user.name,
      });

      // Handle OAuth sign-in (Google)
      if (account?.provider === "google" && account.providerAccountId) {
        try {
          // eslint-disable-next-line no-console
          console.log("[NextAuth] Processing Google OAuth sign-in");
          
          const googleProfile = profile as { email?: string; name?: string } | undefined;
          const email = user.email || googleProfile?.email;
          const name = user.name || googleProfile?.name || "User";
          
          // eslint-disable-next-line no-console
          console.log("[NextAuth] Extracted OAuth data", {
            email,
            name,
            providerAccountId: `${account.providerAccountId.substring(0, 10)}...`,
            userEmail: user.email,
            userProfileEmail: googleProfile?.email,
          });
          
          if (!email) {
            // eslint-disable-next-line no-console
            console.error("[NextAuth] Email is missing for OAuth sign-in", {
              userEmail: user.email,
              profileEmail: googleProfile?.email,
            });
            throw new Error("Email is required for OAuth sign-in");
          }

          // Get user_type from cookies if available (set by signup page)
          let oauthUserType: "learner" | "instructor" | undefined;
          try {
            const cookieStore = await cookies();
            const userTypeCookie = cookieStore.get("oauth_user_type");
            if (userTypeCookie?.value === "instructor" || userTypeCookie?.value === "learner") {
              oauthUserType = userTypeCookie.value;
              // Clear the cookie after reading
              cookieStore.delete("oauth_user_type");
            }
          } catch (e) {
            // Cookie access failed, ignore and use default
            // eslint-disable-next-line no-console
            console.warn("[NextAuth] Failed to read oauth_user_type cookie:", e);
          }

          // eslint-disable-next-line no-console
          console.log("[NextAuth] Calling handleOAuthUser", {
            email,
            provider: "google",
            userType: oauthUserType || "learner (default)",
          });

          // Handle OAuth authentication (login or signup)
          const { token, refresh_token, payload } = await handleOAuthUser(
            email,
            account.providerAccountId,
            "google",
            name,
            oauthUserType
          );

          // eslint-disable-next-line no-console
          console.log("[NextAuth] handleOAuthUser completed successfully", {
            email,
            hasToken: !!token,
            hasRefreshToken: !!refresh_token,
            userId: payload.user_id,
            userType: payload.user_type,
          });

          // Store OAuth data in user object for JWT callback
          (user as unknown as Record<string, unknown>).token = token;
          (user as unknown as Record<string, unknown>).refreshToken = refresh_token;
          (user as unknown as Record<string, unknown>).role = payload.user_type === "instructor" ? "instructor" : "student";
          (user as unknown as Record<string, unknown>).id = String(payload.user_id || email);
          (user as unknown as Record<string, unknown>).name = [payload.first_name, payload.last_name]
            .filter(Boolean)
            .join(" ") || name;

          // eslint-disable-next-line no-console
          console.log("[NextAuth] User object updated, returning true", {
            email,
            role: (user as unknown as Record<string, unknown>).role,
            id: (user as unknown as Record<string, unknown>).id,
          });

          return true;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("[NextAuth] OAuth sign-in failed:", error);
          // Log detailed error for debugging on Vercel
          if (error instanceof Error) {
            // eslint-disable-next-line no-console
            console.error("[NextAuth] OAuth error details:", {
              message: error.message,
              stack: error.stack,
              name: error.name,
            });
          } else {
            // eslint-disable-next-line no-console
            console.error("[NextAuth] OAuth error (non-Error object):", error);
          }
          // Return false to deny access - NextAuth will show AccessDenied error
          return false;
        }
      }

      // eslint-disable-next-line no-console
      console.log("[NextAuth] Non-OAuth sign-in, allowing (credentials provider)");
      // For credentials provider, allow sign-in
      return true;
    },
    async jwt({ token, user, trigger, session, account: _account }) {
      // eslint-disable-next-line no-console
      console.log("[NextAuth] JWT callback triggered", {
        hasUser: !!user,
        trigger,
        hasSession: !!session,
        tokenSub: token.sub,
      });

      // Initial sign in - store tokens from user object and set expiry time
      if (user) {
        const userRole = (user as unknown as { role?: string }).role;
        const userToken = (user as unknown as { token?: string }).token;
        const userRefreshToken = (user as unknown as { refreshToken?: string }).refreshToken;

        // eslint-disable-next-line no-console
        console.log("[NextAuth] Storing user data in JWT token", {
          role: userRole,
          hasToken: !!userToken,
          hasRefreshToken: !!userRefreshToken,
          userId: (user as unknown as { id?: string }).id,
        });

        (token as unknown as Record<string, unknown>).role = userRole;
        (token as unknown as Record<string, unknown>).accessToken = userToken;
        (token as unknown as Record<string, unknown>).refreshToken = userRefreshToken;
        // Set token expiry time - 24 hours from now (in seconds)
        (token as unknown as Record<string, unknown>).accessTokenExpires = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        
        return token;
      }
      
      // Handle manual token refresh - update tokens when explicitly triggered
      if (trigger === "update" && session) {
        // eslint-disable-next-line no-console
        console.log("[NextAuth] Updating JWT token from session");
        const sessionData = session as { accessToken?: string; refreshToken?: string };
        if (sessionData.accessToken) {
          (token as unknown as Record<string, unknown>).accessToken = sessionData.accessToken;
          // Reset expiry time when manually updating token
          (token as unknown as Record<string, unknown>).accessTokenExpires = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        }
        if (sessionData.refreshToken) {
          (token as unknown as Record<string, unknown>).refreshToken = sessionData.refreshToken;
        }
        
        return token;
      }
      
      // Check if access token is expired or about to expire (within 5 minutes)
      const tokenData = token as unknown as {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
      };
      
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (tokenData.accessTokenExpires || 0) - now;
      const shouldRefresh = timeUntilExpiry < 300; // Refresh if less than 5 minutes left
      
      if (shouldRefresh && tokenData.refreshToken) {
        // eslint-disable-next-line no-console
        console.log("[NextAuth] Token expiring soon, attempting refresh", {
          timeUntilExpiry,
          expiresAt: new Date((tokenData.accessTokenExpires || 0) * 1000).toISOString(),
        });
        
        try {
          // Call backend refresh endpoint
          const response = await fetch(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              token: tokenData.accessToken,
              refresh_token: tokenData.refreshToken,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.token && data.refresh_token) {
              // eslint-disable-next-line no-console
              console.log("[NextAuth] Token refresh successful");
              
              // Update token with new access token and refresh token
              (token as unknown as Record<string, unknown>).accessToken = data.token;
              (token as unknown as Record<string, unknown>).refreshToken = data.refresh_token;
              // Reset expiry time - 24 hours from now
              (token as unknown as Record<string, unknown>).accessTokenExpires = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
              
              return token;
            }
          }
          
          // eslint-disable-next-line no-console
          console.error("[NextAuth] Token refresh failed", {
            status: response.status,
            statusText: response.statusText,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("[NextAuth] Token refresh error:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      (session as unknown as Record<string, unknown>).role = (token as unknown as { role?: string }).role;
      (session as unknown as Record<string, unknown>).accessToken = (token as unknown as { accessToken?: string }).accessToken;
      (session as unknown as Record<string, unknown>).refreshToken = (token as unknown as { refreshToken?: string }).refreshToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Ensure callbacks preserve the current URL (localhost or production)
  useSecureCookies: process.env.NODE_ENV === "production",
  logger: {
    error() {
      // suppress noisy fetch errors

    },
    // eslint-disable-next-line no-console
    warn: console.warn,
    // eslint-disable-next-line no-console
    debug: console.debug,
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


