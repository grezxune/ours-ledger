import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireMembership } from "../lib/permissions";

function mapAccount(account: {
  _id: string;
  entityId: string;
  name: string;
  currency: string;
  source: "manual" | "plaid";
  institutionName?: string;
  plaidAccountId?: string;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: account._id,
    entityId: account.entityId,
    name: account.name,
    currency: account.currency,
    source: account.source,
    institutionName: account.institutionName,
    plaidAccountId: account.plaidAccountId,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

/**
 * Lists linked accounts for an authorized entity member.
 */
export const listByEntity = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.userId, args.entityId);

    const accounts = await ctx.db
      .query("entityAccounts")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .collect();

    return accounts
      .sort((left, right) => left.name.localeCompare(right.name) || left.createdAt.localeCompare(right.createdAt))
      .map(mapAccount);
  },
});
