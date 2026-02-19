import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { recordAuditEvent } from "../lib/audit";
import { requireOwner } from "../lib/permissions";
import { nowIso } from "../lib/time";
import { normalizeEmail, requireUserById } from "../lib/users";
import { membershipRoleValidator } from "../lib/validators";

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
 * Creates owner-issued invitations.
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    entityId: v.id("entities"),
    inviteEmail: v.string(),
    role: membershipRoleValidator,
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.userId, args.entityId);
    const inviteEmail = normalizeEmail(args.inviteEmail);

    const existing = await ctx.db
      .query("invitations")
      .withIndex("by_entityId_email_status", (q) =>
        q.eq("entityId", args.entityId).eq("email", inviteEmail).eq("status", "pending"),
      )
      .unique();

    if (existing) {
      return mapInvitation(existing);
    }

    const invitationId = await ctx.db.insert("invitations", {
      entityId: args.entityId,
      email: inviteEmail,
      role: args.role,
      status: "pending",
      invitedByUserId: args.userId,
      createdAt: nowIso(),
    });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: args.entityId,
      action: "invitation.created",
      target: invitationId,
      metadata: {
        invitationId: String(invitationId),
        inviteEmail,
        role: args.role,
      },
    });

    const invitation = await ctx.db.get(invitationId);
    if (!invitation) {
      throw new Error("Invitation creation failed.");
    }

    return mapInvitation(invitation);
  },
});

/**
 * Accepts a pending invitation and binds membership.
 */
export const accept = mutation({
  args: {
    userId: v.id("users"),
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const user = await requireUserById(ctx, args.userId);
    const invitation = await ctx.db.get(args.invitationId);

    if (!invitation || invitation.email !== user.email || invitation.status !== "pending") {
      throw new Error("Invitation not found.");
    }

    await ctx.db.patch(args.invitationId, { status: "accepted" });

    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_userId_entityId", (q) => q.eq("userId", args.userId).eq("entityId", invitation.entityId))
      .unique();

    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, { role: invitation.role });
    } else {
      await ctx.db.insert("memberships", {
        entityId: invitation.entityId,
        userId: args.userId,
        role: invitation.role,
        createdAt: nowIso(),
      });
    }

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: invitation.entityId,
      action: "invitation.accepted",
      target: invitation._id,
      metadata: {
        invitationId: String(invitation._id),
        inviteEmail: invitation.email,
        role: invitation.role,
      },
    });

    return mapInvitation({ ...invitation, status: "accepted" });
  },
});

/**
 * Revokes a pending invitation.
 */
export const revoke = mutation({
  args: {
    userId: v.id("users"),
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    await requireOwner(ctx, args.userId, invitation.entityId);
    await ctx.db.patch(args.invitationId, { status: "revoked" });

    await recordAuditEvent(ctx, {
      actorUserId: args.userId,
      entityId: invitation.entityId,
      action: "invitation.revoked",
      target: invitation._id,
      metadata: {
        invitationId: String(invitation._id),
        inviteEmail: invitation.email,
        role: invitation.role,
      },
    });

    return mapInvitation({ ...invitation, status: "revoked" });
  },
});
