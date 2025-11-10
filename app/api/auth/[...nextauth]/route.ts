import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "@/app/api/auth/login";

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
          // Use the centralized login API function
          const response = await loginUser({
            email: credentials.email,
            password: credentials.password,
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
    async jwt({ token, user }) {
      if (user) {
        (token as unknown as Record<string, unknown>).role = (user as unknown as { role?: string }).role;
        (token as unknown as Record<string, unknown>).accessToken = (user as unknown as { token?: string }).token;
        (token as unknown as Record<string, unknown>).refreshToken = (user as unknown as { refreshToken?: string }).refreshToken;
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


