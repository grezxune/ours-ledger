import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { recordAuditEvent } from "../lib/audit";
import { requireOwner } from "../lib/permissions";
import { nowIso } from "../lib/time";
import { requireUserById } from "../lib/users";
import { entityAddressValidator, entityTypeValidator } from "../lib/validators";
import { mapEntity } from "./mappers";
import type { EntityRecord } from "./types";

const entityInputValidator = v.object({
  type: entityTypeValidator,
  name: v.string(),
  address: entityAddressValidator,
  currency: v.string(),
  description: v.optional(v.string()),
});

const updateEntityInputValidator = v.object({
  name: v.string(),
  address: entityAddressValidator,
  currency: v.string(),
  description: v.optional(v.string()),
});

/**
 * Creates a new entity and owner membership.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    input: entityInputValidator,
  },
  handler: async (ctx, args) => {
    await requireUserById(ctx, args.userId);
    const now = nowIso();
    const entityId = await ctx.db.insert("entities", {
      ...args.input,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("memberships", {
      entityId,
      userId: args.userId,
      role: "owner",
      createdAt: now,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      action: "entity.created",
      target: entityId,
      entityId,
      metadata: {
        type: args.input.type,
        name: args.input.name.trim(),
        currency: args.input.currency.trim(),
        address: args.input.address.formatted,
      },
    });

    const entity = await ctx.db.get(entityId);
    if (!entity) {
      throw new Error("Entity creation failed.");
    }

    return mapEntity(entity as EntityRecord);
  },
});

/**
 * Updates owner-managed entity profile fields.
 */
export const update = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    input: updateEntityInputValidator,
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.userId, args.entityId);

    const entity = await ctx.db.get(args.entityId);
    if (!entity) {
      throw new Error("Entity not found.");
    }

    const updatedAt = nowIso();
    await ctx.db.patch(args.entityId, {
      ...args.input,
      updatedAt,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      action: "entity.updated",
      target: args.entityId,
      entityId: args.entityId,
      metadata: {
        previousName: entity.name,
        name: args.input.name.trim(),
        currency: args.input.currency.trim(),
        address: args.input.address.formatted,
      },
    });

    return mapEntity({
      ...entity,
      ...args.input,
      updatedAt,
    } as EntityRecord);
  },
});
