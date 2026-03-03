import { v } from "convex/values";
import { authenticatedQuery } from "../lib/authFunctions";
import { requireMembership } from "../lib/permissions";

/**
 * Lists institutions configured for an entity.
 */
export const listByEntity = authenticatedQuery({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);

    const institutions = await ctx.db
      .query("entityInstitutions")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .collect();

    return institutions
      .sort((left, right) => left.name.localeCompare(right.name) || left.createdAt.localeCompare(right.createdAt))
      .map((institution) => ({
        id: institution._id,
        entityId: institution.entityId,
        name: institution.name,
        createdAt: institution.createdAt,
        updatedAt: institution.updatedAt,
      }));
  },
});
