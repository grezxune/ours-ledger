"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { AppUser } from "@/lib/domain/types";

type AuthenticatedArgs<T extends Record<string, unknown>> = T & { userId: Id<"users"> };

interface UseAuthUserResult {
  userId: Id<"users"> | null;
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authArgs: <T extends Record<string, unknown>>(args: T) => AuthenticatedArgs<T> | "skip";
}

/**
 * Resolves canonical authenticated user identity for Convex client queries/mutations.
 */
export function useAuthUser(): UseAuthUserResult {
  const { data: session, status } = useSession();
  const email = session?.user?.email?.trim().toLowerCase() || null;
  const ensureUser = useMutation(api.users.mutations.ensureUser);
  const ensureInFlightRef = useRef<string | null>(null);
  const user = useQuery(api.users.queries.getByEmail, email ? { email } : "skip");

  const isSessionLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && Boolean(email);
  const isLoading = isSessionLoading || (isAuthenticated && user === undefined);
  const userId = (user?.id as Id<"users"> | undefined) ?? null;
  const appUser: AppUser | null = user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
        platformRole: user.platformRole,
      }
    : null;

  useEffect(() => {
    if (!email || status !== "authenticated" || user !== null) {
      return;
    }
    if (ensureInFlightRef.current === email) {
      return;
    }

    ensureInFlightRef.current = email;
    void ensureUser({
      email,
      name: session.user?.name ?? undefined,
      platformRole: session.user?.platformRole === "super_admin" ? "super_admin" : "user",
    }).finally(() => {
      ensureInFlightRef.current = null;
    });
  }, [email, ensureUser, session?.user?.name, session?.user?.platformRole, status, user]);

  const authArgs = useCallback(
    <T extends Record<string, unknown>>(args: T): AuthenticatedArgs<T> | "skip" => {
      if (!userId) {
        return "skip";
      }

      return {
        ...args,
        userId,
      };
    },
    [userId],
  );

  return {
    userId,
    user: appUser,
    isLoading,
    isAuthenticated,
    authArgs,
  };
}
