"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { SessionProvider, useSession } from "next-auth/react";

interface ConvexAuthProviderProps {
  children: ReactNode;
}

interface ConvexTokenResponse {
  token?: string;
}

function requireConvexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required to initialize the Convex client.");
  }

  return url;
}

function useNextAuthConvexAuth() {
  const { status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }): Promise<string | null> => {
      if (!isAuthenticated) {
        return null;
      }

      const response = await fetch(
        `/api/auth/convex/token${forceRefreshToken ? "?refresh=1" : ""}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as ConvexTokenResponse;
      return typeof payload.token === "string" ? payload.token : null;
    },
    [isAuthenticated],
  );

  return {
    isLoading,
    isAuthenticated,
    fetchAccessToken,
  };
}

function ConvexAuthBridge({ children }: ConvexAuthProviderProps) {
  const convex = useMemo(() => new ConvexReactClient(requireConvexUrl()), []);
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useNextAuthConvexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

/**
 * Provides NextAuth session context and Convex authenticated client context to the app.
 */
export function ConvexAuthProvider({ children }: ConvexAuthProviderProps) {
  return (
    <SessionProvider>
      <ConvexAuthBridge>{children}</ConvexAuthBridge>
    </SessionProvider>
  );
}
