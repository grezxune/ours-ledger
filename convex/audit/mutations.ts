import { v } from "convex/values";
import { requireAuthenticatedUserId } from "../lib/auth";
import { authenticatedIdentityMutation } from "../lib/authFunctions";
import { recordAuditEvent } from "../lib/audit";
import { auditMetadataValidator } from "../lib/validators";

/**
 * Records a manual audit event for privileged server workflows.
 */
export const record = authenticatedIdentityMutation({
  args: {
    actorUserId: v.id("users"),
    action: v.string(),
    target: v.string(),
    entityId: v.optional(v.id("entities")),
    metadata: v.optional(auditMetadataValidator),
  },
  handler: async (ctx, args) => {
    await requireAuthenticatedUserId(ctx, args.actorUserId);
    await recordAuditEvent(ctx, {
      actorUserId: args.actorUserId,
      action: args.action,
      target: args.target,
      entityId: args.entityId,
      metadata: args.metadata,
    });
    return { ok: true };
  },
});
