import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";
import { nowIso } from "../lib/time";

const createExpenseCategoryInputValidator = v.object({
  name: v.string(),
});

function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Creates an entity-scoped expense category.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    input: createExpenseCategoryInputValidator,
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const trimmedName = args.input.name.trim();
    if (!trimmedName) {
      throw new Error("Category name is required.");
    }

    const normalizedName = normalizeCategoryName(trimmedName);
    const existing = await ctx.db
      .query("entityExpenseCategories")
      .withIndex("by_entityId_normalizedName", (q) =>
        q.eq("entityId", args.entityId).eq("normalizedName", normalizedName),
      )
      .unique();
    if (existing) {
      throw new Error("An expense category with this name already exists.");
    }

    const now = nowIso();
    const categoryId = await ctx.db.insert("entityExpenseCategories", {
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
      action: "expense_category.created",
      target: categoryId,
      metadata: {
        entityId: String(args.entityId),
        expenseCategoryId: String(categoryId),
        name: trimmedName,
      },
    });

    return categoryId;
  },
});
