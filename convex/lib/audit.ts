import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { nowIso } from "./time";

interface AuditInput {
  actorUserId: Id<"users">;
  action: string;
  target: string;
  entityId?: Id<"entities">;
  metadata?: Record<string, string>;
}

export async function recordAuditEvent(ctx: MutationCtx, input: AuditInput): Promise<void> {
  const actor = await ctx.db.get(input.actorUserId);
  if (!actor) {
    throw new Error("Actor user not found.");
  }

  await ctx.db.insert("auditEvents", {
    actorUserId: input.actorUserId,
    actorEmail: actor.email,
    action: input.action,
    target: input.target,
    entityId: input.entityId,
    metadata: input.metadata,
    createdAt: nowIso(),
  });
}
