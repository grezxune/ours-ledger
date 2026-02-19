import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireMembership } from "../lib/permissions";

function mapTransaction(transaction: {
  _id: string;
  entityId: string;
  source: "manual" | "plaid";
  kind: "one_off" | "recurring";
  type: "income" | "expense";
  status: "pending" | "posted" | "voided";
  amountCents: number;
  date: string;
  category: string;
  notes?: string;
  payee?: string;
  recurrence?: { cadence: string; startDate: string; endDate?: string; nextRunAt?: string };
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: transaction._id,
    entityId: transaction.entityId,
    source: transaction.source,
    kind: transaction.kind,
    type: transaction.type,
    status: transaction.status,
    amountCents: transaction.amountCents,
    date: transaction.date,
    category: transaction.category,
    notes: transaction.notes,
    payee: transaction.payee,
    recurrence: transaction.recurrence,
    createdBy: transaction.createdByEmail,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

/**
 * Lists transactions scoped to an authorized entity member.
 */
export const listByEntity = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .collect();

    return transactions
      .sort((left, right) => right.date.localeCompare(left.date) || right.createdAt.localeCompare(left.createdAt))
      .map(mapTransaction);
  },
});
