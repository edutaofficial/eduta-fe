"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Token Refresh Provider
 * 
 * This component:
 * 1. Listens for token refresh events from the token manager
 * 2. Updates the NextAuth session when tokens are refreshed
 * 3. Ensures the session stays in sync with refreshed tokens
 * 
 * This should be placed in the layout near the SessionProvider
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update: updateSession } = useSession();

  useEffect(() => {
    // Listen for token refresh events
    const handleSessionUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent<{
        accessToken: string;
        refreshToken: string;
      }>;

      if (customEvent.detail?.accessToken && customEvent.detail?.refreshToken) {
        // eslint-disable-next-line no-console
        console.log("[TokenRefreshProvider] Received token refresh event, updating NextAuth session");

        try {
          // Update the NextAuth session with new tokens
          await updateSession({
            accessToken: customEvent.detail.accessToken,
            refreshToken: customEvent.detail.refreshToken,
          });

          // eslint-disable-next-line no-console
          console.log("[TokenRefreshProvider] ✅ NextAuth session updated successfully");
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("[TokenRefreshProvider] ❌ Failed to update NextAuth session:", error);
        }
      }
    };

    // Listen for session update events from token manager
    window.addEventListener("session", handleSessionUpdate);

    return () => {
      window.removeEventListener("session", handleSessionUpdate);
    };
  }, [updateSession]);

  // Also check for expired tokens on mount and periodically
  useEffect(() => {
    if (!session) return;

    const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
    if (!accessToken) return;

    // Check token expiration on mount
    import("@/lib/tokenManager").then(({ isTokenExpired, magicalTokenRefresh }) => {
      if (isTokenExpired(accessToken)) {
        // eslint-disable-next-line no-console
        console.log("[TokenRefreshProvider] Token expired on mount, refreshing...");
        magicalTokenRefresh().then((newToken) => {
          if (newToken) {
            // eslint-disable-next-line no-console
            console.log("[TokenRefreshProvider] ✅ Token refreshed on mount");
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error("[TokenRefreshProvider] ❌ Failed to refresh token on mount:", error);
        });
      }
    }).catch(() => {
      // Module import failed, ignore
    });

    // Set up periodic token check (every 5 minutes)
    const checkInterval = setInterval(() => {
      import("@/lib/tokenManager").then(({ isTokenExpired, magicalTokenRefresh }) => {
        const currentAccessToken = (session as unknown as { accessToken?: string })?.accessToken;
        if (currentAccessToken && isTokenExpired(currentAccessToken)) {
          // eslint-disable-next-line no-console
          console.log("[TokenRefreshProvider] Token expired (periodic check), refreshing...");
          magicalTokenRefresh().then((newToken) => {
            if (newToken) {
              // eslint-disable-next-line no-console
              console.log("[TokenRefreshProvider] ✅ Token refreshed (periodic check)");
            }
          }).catch((error) => {
            // eslint-disable-next-line no-console
            console.error("[TokenRefreshProvider] ❌ Failed to refresh token (periodic check):", error);
          });
        }
      }).catch(() => {
        // Module import failed, ignore
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(checkInterval);
    };
  }, [session]);

  return <>{children}</>;
}


