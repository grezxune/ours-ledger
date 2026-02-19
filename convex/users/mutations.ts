import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { nowIso } from "../lib/time";
import { getUserByEmail, normalizeEmail } from "../lib/users";
import { platformRoleValidator } from "../lib/validators";

/**
 * Upserts user profile from Auth.js session identity.
 */
export const ensureUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    platformRole: platformRoleValidator,
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const now = nowIso();
    const fallbackName = email.split("@")[0] || "user";
    const name = args.name?.trim() || fallbackName;

    const existing = await getUserByEmail(ctx, email);
    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        platformRole: args.platformRole,
        updatedAt: now,
      });

      return {
        id: existing._id,
        email: existing.email,
        name,
        platformRole: args.platformRole,
      };
    }

    const id = await ctx.db.insert("users", {
      email,
      name,
      platformRole: args.platformRole,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      email,
      name,
      platformRole: args.platformRole,
    };
  },
});
