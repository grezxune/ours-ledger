import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";
import { nowIso } from "../lib/time";
import { budgetPeriodValidator } from "../lib/validators";

const incomeSourceInputValidator = v.object({
  name: v.string(),
  amountCents: v.number(),
  cadence: budgetPeriodValidator,
  notes: v.optional(v.string()),
});

function requirePositiveAmount(amountCents: number) {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
}

/**
 * Updates a planned income source line on a budget.
 */
export const updateIncomeSource = mutation({
  args: {
    userId: v.id("users"),
    incomeSourceId: v.id("budgetIncomeSources"),
    input: incomeSourceInputValidator,
  },
  handler: async (ctx, args) => {
    requirePositiveAmount(args.input.amountCents);
    const incomeSource = await ctx.db.get(args.incomeSourceId);
    if (!incomeSource) {
      throw new Error("Income source not found.");
    }

    await requireMembership(ctx, args.userId, incomeSource.entityId);
    const now = nowIso();
    await ctx.db.patch(args.incomeSourceId, {
      name: args.input.name.trim(),
      amountCents: args.input.amountCents,
      cadence: args.input.cadence,
      notes: args.input.notes,
      updatedAt: now,
    });

    await ctx.db.patch(incomeSource.budgetId, {
      updatedAt: now,
      updatedByUserId: args.userId,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: incomeSource.entityId,
      action: "budget.income_source_updated",
      target: incomeSource._id,
      metadata: {
        budgetId: String(incomeSource.budgetId),
        incomeSourceId: String(incomeSource._id),
        previousName: incomeSource.name,
        previousAmountCents: String(incomeSource.amountCents),
        name: args.input.name.trim(),
        amountCents: String(args.input.amountCents),
        cadence: args.input.cadence,
        notes: args.input.notes?.trim() || "",
      },
    });
  },
});
