import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import { getBaseUrl } from "@/lib/config/api";

/**
 * API endpoint to refresh access tokens
 * This endpoint updates the NextAuth session with new tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current token from NextAuth
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = token as unknown as { 
      accessToken?: string; 
      refreshToken?: string;
    };

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "No tokens found in session" },
        { status: 401 }
      );
    }

    // Call the backend refresh endpoint
    const response = await axios.post(
      `${getBaseUrl()}api/v1/auth/refresh`,
      {
        token: accessToken,
        refresh_token: refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const newAccessToken = response.data?.token;
    const newRefreshToken = response.data?.refresh_token;

    if (!newAccessToken || !newRefreshToken) {
      return NextResponse.json(
        { error: "Invalid refresh response" },
        { status: 400 }
      );
    }

    // Return the new tokens
    // Note: The actual session update will be handled by the JWT callback
    // when the next session check occurs
    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Token refresh error:", error);
    
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}

