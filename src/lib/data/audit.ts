import "server-only";
import { api } from "@convex/_generated/api";
import type { AuditEvent, AuditEventDetail } from "@/lib/domain/types";
import { asId, createConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

interface AuditInput {
  actorEmail: string;
  action: string;
  target: string;
  entityId?: string;
  metadata?: Record<string, string>;
}

/**
 * Appends audit entries for privileged and financial actions.
 */
export async function recordAuditEvent(input: AuditInput): Promise<void> {
  const user = await ensureUser(input.actorEmail);
  const client = createConvexClient();

  await client.mutation(api.audit.mutations.record, {
    actorUserId: asId<"users">(user.id),
    action: input.action,
    target: input.target,
    entityId: input.entityId ? asId<"entities">(input.entityId) : undefined,
    metadata: input.metadata,
  });
}

/**
 * Returns most recent audit entries for display.
 */
export async function listAuditEvents(userEmail: string, limit = 20): Promise<AuditEvent[]> {
  const user = await ensureUser(userEmail);
  const client = createConvexClient();
  return client.query(api.audit.queries.listRecent, {
    userId: asId<"users">(user.id),
    limit,
  });
}

/**
 * Returns one audit event with resolved context records.
 */
export async function getAuditEventDetail(
  userEmail: string,
  auditEventId: string,
): Promise<AuditEventDetail> {
  const user = await ensureUser(userEmail);
  const client = createConvexClient();
  return client.query(api.audit.queries.getById, {
    userId: asId<"users">(user.id),
    auditEventId: asId<"auditEvents">(auditEventId),
  });
}
