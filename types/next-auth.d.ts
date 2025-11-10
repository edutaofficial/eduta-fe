import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extended User object with additional properties
   */
  interface User extends DefaultUser {
    role?: "student" | "instructor" | "admin";
    token?: string;
    refreshToken?: string;
  }

  /**
   * Extended Session object with access and refresh tokens
   */
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    role?: "student" | "instructor" | "admin";
    user: {
      id?: string;
      email?: string;
      name?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT object with access and refresh tokens
   */
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    role?: "student" | "instructor" | "admin";
  }
}

