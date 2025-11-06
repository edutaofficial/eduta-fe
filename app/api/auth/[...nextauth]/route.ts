import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE_URL =  process.env.API_BASE_URL || "http://54.183.140.154:3005";
console.log(API_BASE_URL);
async function parseResponseSafe(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

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
        if (!credentials?.email || !credentials?.password) return null;
        const response = await fetch(`${API_BASE_URL}/api/v1/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });
        const data = (await parseResponseSafe(response)) as {
          status?: string;
          message?: string;
          data?: { token?: string };
        };
        if (!response.ok || data?.status !== "success") return null;
        const token = data?.data?.token as string | undefined;
        if (!token) return null;
        const payload = decodeJwtPayload(token);
        const role = payload?.user_type === "instructor" ? "instructor" : "student";
        const name = [payload?.first_name, payload?.last_name].filter(Boolean).join(" ") || "User";
        const payloadTyped = payload as { user_id?: string; email?: string };
        const userObj = {
          id: String(payloadTyped?.user_id || payloadTyped?.email),
          email: payloadTyped?.email || credentials.email,
          name,
          role,
          token,
        } as { id: string; email: string; name: string; role: string; token: string };
        return userObj;
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


