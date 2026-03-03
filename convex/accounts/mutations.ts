import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";
import { nowIso } from "../lib/time";
import { accountSourceValidator } from "../lib/validators";

const createAccountInputValidator = v.object({
  name: v.string(),
  currency: v.string(),
  source: accountSourceValidator,
  institutionId: v.id("entityInstitutions"),
  plaidAccountId: v.optional(v.string()),
});

/**
 * Creates a manual or plaid-linked account reference for budget attribution.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    input: createAccountInputValidator,
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const institution = await ctx.db.get(args.input.institutionId);
    if (!institution || institution.entityId !== args.entityId) {
      throw new Error("Selected institution is not available for this entity.");
    }
    const now = nowIso();

    const accountId = await ctx.db.insert("entityAccounts", {
      entityId: args.entityId,
      name: args.input.name.trim(),
      currency: args.input.currency.trim(),
      source: args.input.source,
      institutionId: args.input.institutionId,
      institutionName: institution.name,
      plaidAccountId: args.input.plaidAccountId?.trim() || undefined,
      createdByUserId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: args.entityId,
      action: "account.created",
      target: accountId,
      metadata: {
        entityId: String(args.entityId),
        accountId: String(accountId),
        name: args.input.name.trim(),
        currency: args.input.currency.trim(),
        source: args.input.source,
        institutionId: String(args.input.institutionId),
        institutionName: institution.name,
        plaidAccountId: args.input.plaidAccountId?.trim() || "",
      },
    });

    return accountId;
  },
});
