import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireMembership, requireOwner } from "../lib/permissions";
import { requireUserById } from "../lib/users";
import { mapEntity } from "./mappers";

function mapMembership(
  membership: { _id: string; entityId: string; role: "owner" | "user"; createdAt: string },
  userEmail: string,
) {
  return {
    id: membership._id,
    entityId: membership.entityId,
    userEmail,
    role: membership.role,
    createdAt: membership.createdAt,
  };
}

/**
 * Lists entities visible to the user.
 */
export const listForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUserById(ctx, args.userId);
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const entries = await Promise.all(
      memberships.map(async (membership) => {
        const entity = await ctx.db.get(membership.entityId);
        if (!entity) {
          return null;
        }

        return {
          entity: mapEntity(entity),
          membership: mapMembership(membership, user.email),
        };
      }),
    );

    return entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  },
});

/**
 * Loads one entity visible to the user.
 */
export const getForUser = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const entity = await ctx.db.get(args.entityId);
    if (!entity) {
      throw new Error("Entity not found.");
    }

    return mapEntity(entity);
  },
});

/**
 * Validates and returns membership for user/entity.
 */
export const getMembershipForUser = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const user = await requireUserById(ctx, args.userId);
    const membership = await requireMembership(ctx, args.userId, args.entityId);
    return mapMembership(membership, user.email);
  },
});

/**
 * Validates and returns owner membership for user/entity.
 */
export const requireOwnerForUser = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const user = await requireUserById(ctx, args.userId);
    const membership = await requireOwner(ctx, args.userId, args.entityId);
    return mapMembership(membership, user.email);
  },
});

/**
 * Lists entity members for authorized collaborators.
 */
export const listMembersForEntity = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        if (!user) {
          return null;
        }
        return mapMembership(membership, user.email);
      }),
    );

    return members
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((left, right) => left.role.localeCompare(right.role) || left.userEmail.localeCompare(right.userEmail));
  },
});
