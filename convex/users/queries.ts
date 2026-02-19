import { query } from "../_generated/server";
import { v } from "convex/values";
import { getUserByEmail } from "../lib/users";

/**
 * Resolves a user by email for server-side identity bridging.
 */
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
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
