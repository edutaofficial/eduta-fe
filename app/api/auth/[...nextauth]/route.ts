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
          return null;
        }

        try {
          // Use the centralized login API function
          const response = await loginUser({
            email: credentials.email,
            password: credentials.password,
          });

          const { token } = response.data;
          if (!token) return null;

          // Decode JWT to extract user information
          const payload = decodeJwtPayload(token);
          if (!payload) return null;

          const role = payload.user_type === "instructor" ? "instructor" : "student";
          const name =
            [payload.first_name, payload.last_name]
              .filter(Boolean)
              .join(" ") || "User";

          const userObj = {
            id: String(payload.user_id || payload.email || credentials.email),
            email: (payload.email as string) || credentials.email,
            name,
            role,
            token,
          };

          return userObj;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as unknown as Record<string, unknown>).role = (user as unknown as { role?: string }).role;
        (token as unknown as Record<string, unknown>).accessToken = (user as unknown as { token?: string }).token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as unknown as Record<string, unknown>).role = (token as unknown as { role?: string }).role;
      (session as unknown as Record<string, unknown>).accessToken = (token as unknown as { accessToken?: string }).accessToken;
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


