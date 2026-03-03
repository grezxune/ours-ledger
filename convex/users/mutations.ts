import { v } from "convex/values";
import { requireAuthIdentity } from "../lib/auth";
import { authenticatedIdentityMutation } from "../lib/authFunctions";
import { nowIso } from "../lib/time";
import { getUserByEmail, normalizeEmail } from "../lib/users";
import { platformRoleValidator } from "../lib/validators";

function resolvePlatformRoleFromIdentity(platformRole: unknown): "user" | "super_admin" {
  return platformRole === "super_admin" ? "super_admin" : "user";
}

/**
 * Upserts user profile from Auth.js session identity.
 */
export const ensureUser = authenticatedIdentityMutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    platformRole: platformRoleValidator,
  },
  handler: async (ctx, args) => {
    const identity = await requireAuthIdentity(ctx);
    const identityEmail = identity.email ? normalizeEmail(identity.email) : null;
    const requestedEmail = normalizeEmail(args.email);
    if (!identityEmail || identityEmail !== requestedEmail) {
      throw new Error("Forbidden: email claim mismatch.");
    }

    const platformRole = resolvePlatformRoleFromIdentity(identity.platformRole);
    if (args.platformRole !== platformRole) {
      throw new Error("Forbidden: platform role mismatch.");
    }

    const email = requestedEmail;
    const now = nowIso();
    const fallbackName = email.split("@")[0] || "user";
    const name = args.name?.trim() || fallbackName;

    const existing = await getUserByEmail(ctx, email);
    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        platformRole,
        updatedAt: now,
      });

      return {
        id: existing._id,
        email: existing.email,
        name,
        platformRole,
      };
    }

    const id = await ctx.db.insert("users", {
      email,
      name,
      platformRole,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      email,
      name,
      platformRole,
    };
  },
});
