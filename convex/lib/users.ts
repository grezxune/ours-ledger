import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Context = QueryCtx | MutationCtx;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(ctx: Context, email: string): Promise<Doc<"users"> | null> {
  return ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
    .unique();
}

export async function requireUserById(ctx: Context, userId: Id<"users">): Promise<Doc<"users">> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("Authenticated user not found.");
  }

  return user;
}
