import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";

export const removeIncomeSource = mutation({
  args: {
    userId: v.id("users"),
    incomeSourceId: v.id("budgetIncomeSources"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.incomeSourceId);
    if (!item) throw new Error("Income source not found.");

    await requireMembership(ctx, args.userId, item.entityId);
    await ctx.db.delete(item._id);
    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: item.entityId,
      action: "budget.income_source_removed",
      target: item._id,
      metadata: {
        budgetId: String(item.budgetId),
        incomeSourceId: String(item._id),
        name: item.name,
        amountCents: String(item.amountCents),
        cadence: item.cadence,
        notes: item.notes || "",
      },
    });
  },
});

export const removeRecurringExpense = mutation({
  args: {
    userId: v.id("users"),
    recurringExpenseId: v.id("budgetRecurringExpenses"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.recurringExpenseId);
    if (!item) throw new Error("Recurring expense not found.");

    await requireMembership(ctx, args.userId, item.entityId);
    await ctx.db.delete(item._id);
    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: item.entityId,
      action: "budget.recurring_expense_removed",
      target: item._id,
      metadata: {
        budgetId: String(item.budgetId),
        recurringExpenseId: String(item._id),
        accountId: item.accountId ? String(item.accountId) : "",
        name: item.name,
        amountCents: String(item.amountCents),
        cadence: item.cadence,
        category: item.category || "",
        notes: item.notes || "",
      },
    });
  },
});
