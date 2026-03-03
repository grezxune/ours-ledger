import { v } from "convex/values";
import { requireAuthIdentity } from "../lib/auth";
import { authenticatedIdentityQuery } from "../lib/authFunctions";
import { getUserByEmail } from "../lib/users";

/**
 * Resolves a user by email for server-side identity bridging.
 */
export const getByEmail = authenticatedIdentityQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuthIdentity(ctx);
    if (identity.email?.toLowerCase() !== args.email.trim().toLowerCase()) {
      throw new Error("Forbidden: user email mismatch.");
    }

    const user = await getUserByEmail(ctx, args.email);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      platformRole: user.platformRole,
    };
  },
});
