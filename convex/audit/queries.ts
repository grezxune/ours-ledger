import { query } from "../_generated/server";
import { v } from "convex/values";
import { canViewAuditEvent, getAuditViewer, resolveAuditDetail } from "./detail";

function mapAuditEvent(event: {
  _id: string;
  entityId?: string;
  actorEmail: string;
  action: string;
  target: string;
  createdAt: string;
  metadata?: Record<string, string>;
}) {
  return {
    id: event._id,
    entityId: event.entityId,
    actorEmail: event.actorEmail,
    action: event.action,
    target: event.target,
    createdAt: event.createdAt,
    metadata: event.metadata,
  };
}

/**
 * Returns most recent audit events for dashboard visibility.
 */
export const listRecent = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await getAuditViewer(ctx, args.userId);
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100));
    const events = await ctx.db.query("auditEvents").collect();

    return events
      .filter((event) => canViewAuditEvent(event, viewer))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit)
      .map(mapAuditEvent);
  },
});

/**
 * Returns one audit event plus resolved target/entity context.
 */
export const getById = query({
  args: {
    userId: v.id("users"),
    auditEventId: v.id("auditEvents"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.auditEventId);
    if (!event) {
      throw new Error("Audit event not found.");
    }

    const viewer = await getAuditViewer(ctx, args.userId);
    if (!canViewAuditEvent(event, viewer)) {
      throw new Error("You do not have access to this audit event.");
    }

    const detail = await resolveAuditDetail(ctx, event);
    return {
      ...mapAuditEvent(event),
      ...detail,
    };
  },
});
