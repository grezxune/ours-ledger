import "server-only";
import { api } from "@convex/_generated/api";
import type { AppUser } from "@/lib/domain/types";
import { resolvePlatformRole } from "@/lib/auth/roles";
import { createAuthenticatedConvexClient } from "@/lib/data/convex";

/**
 * Ensures an authenticated principal has a corresponding Convex user.
 */
export async function ensureUser(email: string, name?: string | null): Promise<AppUser> {
  const normalizedEmail = email.toLowerCase();
  const client = await createAuthenticatedConvexClient(normalizedEmail, name);

  return client.mutation(api.users.mutations.ensureUser, {
    email: normalizedEmail,
    name: name ?? undefined,
    platformRole: resolvePlatformRole(normalizedEmail),
  });
}
