import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";
import { nowIso } from "../lib/time";

const createInstitutionInputValidator = v.object({
  name: v.string(),
});

function normalizeInstitutionName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Creates an entity-scoped institution entry for account selection.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    input: createInstitutionInputValidator,
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const trimmedName = args.input.name.trim();
    if (!trimmedName) {
      throw new Error("Institution name is required.");
    }
    const normalizedName = normalizeInstitutionName(trimmedName);
    const existing = await ctx.db
      .query("entityInstitutions")
      .withIndex("by_entityId_normalizedName", (q) =>
        q.eq("entityId", args.entityId).eq("normalizedName", normalizedName),
      )
      .unique();
    if (existing) {
      throw new Error("An institution with this name already exists.");
    }

    const now = nowIso();
    const institutionId = await ctx.db.insert("entityInstitutions", {
      entityId: args.entityId,
      name: trimmedName,
      normalizedName,
      createdByUserId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: args.entityId,
      action: "institution.created",
      target: institutionId,
      metadata: {
        entityId: String(args.entityId),
        institutionId: String(institutionId),
        name: trimmedName,
      },
    });

    return institutionId;
  },
});
