import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { recordAuditEvent } from "../lib/audit";
import { auditMetadataValidator } from "../lib/validators";

/**
 * Records a manual audit event for privileged server workflows.
 */
export const record = mutation({
  args: {
    actorUserId: v.id("users"),
    action: v.string(),
    target: v.string(),
    entityId: v.optional(v.id("entities")),
    metadata: v.optional(auditMetadataValidator),
  },
  handler: async (ctx, args) => {
    await recordAuditEvent(ctx, args);
    return { ok: true };
  },
});
