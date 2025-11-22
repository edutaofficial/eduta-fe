import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
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
 */
async function handleOAuthUser(
  email: string,
  providerId: string,
  provider: "google" | "facebook",
  name: string
): Promise<{ token: string; refresh_token?: string; payload: Record<string, unknown> }> {
  try {
    // Try to login first (user might already exist)
    const loginResponse = await loginUser({
      email,
      provider,
      providerId,
    });

    const { token, refresh_token } = loginResponse.data;
    if (!token) {
      throw new Error("No token received from login");
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      throw new Error("Invalid token received");
    }

    return { token, refresh_token, payload };
  } catch {
    // If login fails, user doesn't exist - create account
    // eslint-disable-next-line no-console
    console.log(`User ${email} not found, creating new account via ${provider}`);

    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ");

    // Create new user via OAuth signup
    await signupUser({
      email,
      first_name: firstName || name,
      last_name: lastName || "",
      user_type: "learner", // Default to learner for OAuth signups
      provider,
      providerId,
    });

    // Now login with the newly created account
    const loginResponse = await loginUser({
      email,
      provider,
      providerId,
    });

    const { token, refresh_token } = loginResponse.data;
    if (!token) {
      throw new Error("No token received after signup");
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      throw new Error("Invalid token received after signup");
    }

    return { token, refresh_token, payload };
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
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
      // Handle OAuth sign-in (Google)
      if (account?.provider === "google" && account.providerAccountId) {
        try {
          const googleProfile = profile as { email?: string; name?: string } | undefined;
          const email = user.email || googleProfile?.email;
          const name = user.name || googleProfile?.name || "User";
          
          if (!email) {
            throw new Error("Email is required for OAuth sign-in");
          }

          // Handle OAuth authentication (login or signup)
          const { token, refresh_token, payload } = await handleOAuthUser(
            email,
            account.providerAccountId,
            "google",
            name
          );

          // Store OAuth data in user object for JWT callback
          (user as unknown as Record<string, unknown>).token = token;
          (user as unknown as Record<string, unknown>).refreshToken = refresh_token;
          (user as unknown as Record<string, unknown>).role = payload.user_type === "instructor" ? "instructor" : "student";
          (user as unknown as Record<string, unknown>).id = String(payload.user_id || email);
          (user as unknown as Record<string, unknown>).name = [payload.first_name, payload.last_name]
            .filter(Boolean)
            .join(" ") || name;

          return true;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("OAuth sign-in failed:", error);
          return false;
        }
      }

      // For credentials provider, allow sign-in
      return true;
    },
    async jwt({ token, user, trigger, session, account: _account }) {
      // Initial sign in - store tokens from user object
      if (user) {
        (token as unknown as Record<string, unknown>).role = (user as unknown as { role?: string }).role;
        (token as unknown as Record<string, unknown>).accessToken = (user as unknown as { token?: string }).token;
        (token as unknown as Record<string, unknown>).refreshToken = (user as unknown as { refreshToken?: string }).refreshToken;
      }
      
      // Handle token refresh - update tokens when explicitly triggered
      if (trigger === "update" && session) {
        const sessionData = session as { accessToken?: string; refreshToken?: string };
        if (sessionData.accessToken) {
          (token as unknown as Record<string, unknown>).accessToken = sessionData.accessToken;
        }
        if (sessionData.refreshToken) {
          (token as unknown as Record<string, unknown>).refreshToken = sessionData.refreshToken;
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


