import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Context = QueryCtx | MutationCtx;

export async function requireMembership(
  ctx: Context,
  userId: Id<"users">,
  entityId: Id<"entities">,
): Promise<Doc<"memberships">> {
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_userId_entityId", (q) => q.eq("userId", userId).eq("entityId", entityId))
    .unique();

  if (!membership) {
    throw new Error("You do not have access to this entity.");
  }

  return membership;
}

export async function requireOwner(
  ctx: Context,
  userId: Id<"users">,
  entityId: Id<"entities">,
): Promise<Doc<"memberships">> {
  const membership = await requireMembership(ctx, userId, entityId);
  if (membership.role !== "owner") {
    throw new Error("Only owners can perform this action.");
  }

  return membership;
}
