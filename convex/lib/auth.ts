import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { UserIdentity } from "convex/server";
import { requireUserById } from "./users";

type Context = QueryCtx | MutationCtx;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getIdentityEmail(identity: UserIdentity | null): string | null {
  const email = identity?.email;
  return email ? normalizeEmail(email) : null;
}

function getIdentityPlatformRole(identity: UserIdentity | null): "user" | "super_admin" {
  return identity?.platformRole === "super_admin" ? "super_admin" : "user";
}

export async function getAuthIdentity(ctx: Context): Promise<UserIdentity | null> {
  return ctx.auth.getUserIdentity();
}

export async function requireAuthIdentity(ctx: Context): Promise<UserIdentity> {
  const identity = await getAuthIdentity(ctx);
  if (!identity) {
    throw new Error("Authentication required.");
  }

  const email = getIdentityEmail(identity);
  if (!email) {
    throw new Error("Authenticated identity is missing an email claim.");
  }

  return identity;
}

async function getAuthEmail(ctx: Context): Promise<string | null> {
  const identity = await getAuthIdentity(ctx);
  return getIdentityEmail(identity);
}

async function getUserByEmail(ctx: Context, email: string): Promise<Doc<"users"> | null> {
  return ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
    .unique();
}

export async function getAuthUser(ctx: Context): Promise<Doc<"users"> | null> {
  const email = await getAuthEmail(ctx);
  if (!email) {
    return null;
  }

  return getUserByEmail(ctx, email);
}

export async function getAuthUserId(ctx: Context): Promise<Id<"users"> | null> {
  const user = await getAuthUser(ctx);
  return user?._id ?? null;
}

export async function requireAuth(ctx: Context): Promise<Doc<"users">> {
  const user = await getAuthUser(ctx);
  if (!user) {
    throw new Error("Authentication required.");
  }

  return user;
}

export async function requireAuthUserId(ctx: Context): Promise<Id<"users">> {
  const user = await requireAuth(ctx);
  return user._id;
}

export async function requireAuthenticatedUserId(
  ctx: Context,
  requestedUserId?: Id<"users">,
): Promise<Id<"users">> {
  const authUserId = await requireAuthUserId(ctx);
  if (requestedUserId && requestedUserId !== authUserId) {
    throw new Error("Forbidden: user ID mismatch.");
  }

  return authUserId;
}

export async function requireOwnership<T extends { userId: Id<"users"> }>(
  ctx: Context,
  resource: T | null,
  resourceName = "Resource",
): Promise<T> {
  if (!resource) {
    throw new Error(`${resourceName} not found.`);
  }

  const authUserId = await requireAuthUserId(ctx);
  if (resource.userId !== authUserId) {
    throw new Error(`Forbidden: ${resourceName} is not owned by the authenticated user.`);
  }

  return resource;
}

export async function requirePremium(ctx: Context): Promise<Doc<"users">> {
  const identity = await requireAuthIdentity(ctx);
  const role = getIdentityPlatformRole(identity);
  if (role !== "super_admin") {
    throw new Error("Premium access required.");
  }

  const user = await requireAuth(ctx);
  return user;
}

export async function hasPremiumAccess(ctx: Context): Promise<boolean> {
  const identity = await getAuthIdentity(ctx);
  return getIdentityPlatformRole(identity) === "super_admin";
}

export async function requireSuperAdminByUserId(
  ctx: Context,
  requestedUserId?: Id<"users">,
): Promise<Doc<"users">> {
  const userId = await requireAuthenticatedUserId(ctx, requestedUserId);
  const user = await requireUserById(ctx, userId);
  if (user.platformRole !== "super_admin") {
    throw new Error("Super admin access required.");
  }

  return user;
}
