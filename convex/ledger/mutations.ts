import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { recordAuditEvent } from "../lib/audit";
import { requireMembership } from "../lib/permissions";
import { nowIso } from "../lib/time";
import { requireUserById } from "../lib/users";
import {
  recurrenceValidator,
  transactionKindValidator,
  transactionStatusValidator,
  transactionTypeValidator,
} from "../lib/validators";

const transactionInputValidator = v.object({
  kind: transactionKindValidator,
  type: transactionTypeValidator,
  status: transactionStatusValidator,
  amountCents: v.number(),
  date: v.string(),
  category: v.string(),
  payee: v.optional(v.string()),
  notes: v.optional(v.string()),
  recurrence: v.optional(recurrenceValidator),
});

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
 * Creates a manual transaction with entity-scoped authorization.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    input: transactionInputValidator,
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);
    const actor = await requireUserById(ctx, args.userId);
    const now = nowIso();

    const transactionId = await ctx.db.insert("transactions", {
      entityId: args.entityId,
      source: "manual",
      ...args.input,
      createdByUserId: args.userId,
      createdByEmail: actor.email,
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: args.entityId,
      action: "transaction.created",
      target: transactionId,
      metadata: {
        entityId: String(args.entityId),
        transactionId: String(transactionId),
        kind: args.input.kind,
        type: args.input.type,
        status: args.input.status,
        amountCents: String(args.input.amountCents),
        date: args.input.date,
        category: args.input.category.trim(),
        payee: args.input.payee?.trim() || "",
      },
    });

    const transaction = await ctx.db.get(transactionId);
    if (!transaction) {
      throw new Error("Transaction creation failed.");
    }

    return mapTransaction(transaction);
  },
});
