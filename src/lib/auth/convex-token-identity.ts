import type { Session } from "next-auth";

/**
 * Derives Convex token identity claims from the active Auth.js session.
 */
export function resolveConvexTokenIdentity(session: Session | null) {
  const user = session?.user;
  const email = user?.email?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  return {
    email,
    name: user?.name,
    platformRole: user?.platformRole,
  };
}
