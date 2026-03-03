import { v } from "convex/values";
import { authenticatedQuery } from "../lib/authFunctions";
import { requireMembership } from "../lib/permissions";

/**
 * Lists expense categories configured for an entity.
 */
export const listByEntity = authenticatedQuery({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);

    const categories = await ctx.db
      .query("entityExpenseCategories")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .collect();

    return categories
      .sort((left, right) => left.name.localeCompare(right.name) || left.createdAt.localeCompare(right.createdAt))
      .map((category) => ({
        id: category._id,
        entityId: category.entityId,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
  },
});
