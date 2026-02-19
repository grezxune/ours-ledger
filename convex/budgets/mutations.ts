import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";
import { nowIso } from "../lib/time";
import { budgetPeriodValidator } from "../lib/validators";

const createBudgetInputValidator = v.object({
  name: v.string(),
  period: budgetPeriodValidator,
  effectiveDate: v.string(),
});

const incomeSourceInputValidator = v.object({
  name: v.string(),
  amountCents: v.number(),
  cadence: budgetPeriodValidator,
  notes: v.optional(v.string()),
});

const recurringExpenseInputValidator = v.object({
  name: v.string(),
  amountCents: v.number(),
  cadence: budgetPeriodValidator,
  accountId: v.optional(v.id("entityAccounts")),
  category: v.optional(v.string()),
  notes: v.optional(v.string()),
});

async function requireBudgetMembership(
  ctx: MutationCtx,
  userId: Id<"users">,
  budgetId: Id<"entityBudgets">,
) {
  const budget = await ctx.db.get(budgetId);
  if (!budget) {
    throw new Error("Budget not found.");
  }

  await requireMembership(ctx, userId, budget.entityId);
  return budget;
}

function requirePositiveAmount(amountCents: number) {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
}

export const createBudget = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    input: createBudgetInputValidator,
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const now = nowIso();
    const budgetId = await ctx.db.insert("entityBudgets", {
      entityId: args.entityId,
      name: args.input.name.trim(),
      period: args.input.period,
      effectiveDate: args.input.effectiveDate,
      status: "active",
      createdByUserId: args.userId,
      updatedByUserId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: args.entityId,
      action: "budget.created",
      target: budgetId,
      metadata: {
        budgetId: String(budgetId),
        name: args.input.name.trim(),
        period: args.input.period,
        effectiveDate: args.input.effectiveDate,
      },
    });

    return budgetId;
  },
});

export const addIncomeSource = mutation({
  args: {
    userId: v.id("users"),
    budgetId: v.id("entityBudgets"),
    input: incomeSourceInputValidator,
  },
  handler: async (ctx, args) => {
    requirePositiveAmount(args.input.amountCents);
    const budget = await requireBudgetMembership(ctx, args.userId, args.budgetId);
    const now = nowIso();
    const lineId = await ctx.db.insert("budgetIncomeSources", {
      budgetId: args.budgetId,
      entityId: budget.entityId,
      ...args.input,
      name: args.input.name.trim(),
      createdByUserId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.budgetId, { updatedAt: now, updatedByUserId: args.userId });
    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: budget.entityId,
      action: "budget.income_source_added",
      target: lineId,
      metadata: { budgetId: String(args.budgetId), incomeSourceId: String(lineId) },
    });

    return lineId;
  },
});

export const addRecurringExpense = mutation({
  args: {
    userId: v.id("users"),
    budgetId: v.id("entityBudgets"),
    input: recurringExpenseInputValidator,
  },
  handler: async (ctx, args) => {
    requirePositiveAmount(args.input.amountCents);
    const budget = await requireBudgetMembership(ctx, args.userId, args.budgetId);
    if (args.input.accountId) {
      const account = await ctx.db.get(args.input.accountId);
      if (!account || account.entityId !== budget.entityId) {
        throw new Error("Selected account is not available for this entity.");
      }
    }
    const now = nowIso();
    const lineId = await ctx.db.insert("budgetRecurringExpenses", {
      budgetId: args.budgetId,
      entityId: budget.entityId,
      ...args.input,
      name: args.input.name.trim(),
      createdByUserId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.budgetId, { updatedAt: now, updatedByUserId: args.userId });
    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: budget.entityId,
      action: "budget.recurring_expense_added",
      target: lineId,
      metadata: { budgetId: String(args.budgetId), recurringExpenseId: String(lineId) },
    });

    return lineId;
  },
});
export { removeIncomeSource, removeRecurringExpense } from "./removeMutations";
