import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireOwner } from "../lib/permissions";
import { requireUserById } from "../lib/users";

function mapInvitation(invitation: {
  _id: string;
  entityId: string;
  email: string;
  role: "owner" | "user";
  status: "pending" | "accepted" | "revoked" | "expired";
  invitedByUserId: string;
  createdAt: string;
}) {
  return {
    id: invitation._id,
    entityId: invitation.entityId,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    invitedBy: invitation.invitedByUserId,
    createdAt: invitation.createdAt,
  };
}

/**
 * Lists invitations by entity for owners.
 */
export const listEntityInvitations = query({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.userId, args.entityId);

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_entityId", (q) => q.eq("entityId", args.entityId))
      .collect();

    return invitations.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(mapInvitation);
  },
});

/**
 * Lists invitations addressed to the current user.
 */
export const listUserInvitations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await requireUserById(ctx, args.userId);
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email_status", (q) => q.eq("email", user.email).eq("status", "pending"))
      .collect();

    return invitations.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(mapInvitation);
  },
});
