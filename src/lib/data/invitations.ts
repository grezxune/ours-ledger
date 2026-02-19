import "server-only";
import { api } from "@convex/_generated/api";
import type { Invitation, MembershipRole } from "@/lib/domain/types";
import { asId, createConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

async function requireUserId(userEmail: string) {
  const user = await ensureUser(userEmail);
  return asId<"users">(user.id);
}

/**
 * Lists invitations by entity for authorized members.
 */
export async function listEntityInvitations(userEmail: string, entityId: string): Promise<Invitation[]> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.invitations.queries.listEntityInvitations, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Lists invitations addressed to the current user.
 */
export async function listUserInvitations(userEmail: string): Promise<Invitation[]> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();
  return client.query(api.invitations.queries.listUserInvitations, { userId });
}

/**
 * Creates an invitation from an entity owner.
 */
export async function createInvitation(
  ownerEmail: string,
  entityId: string,
  inviteEmail: string,
  role: MembershipRole,
): Promise<Invitation> {
  const userId = await requireUserId(ownerEmail);
  const client = createConvexClient();

  return client.mutation(api.invitations.mutations.create, {
    userId,
    entityId: asId<"entities">(entityId),
    inviteEmail,
    role,
  });
}

/**
 * Accepts a pending invitation and binds membership.
 */
export async function acceptInvitation(userEmail: string, invitationId: string): Promise<Invitation> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.mutation(api.invitations.mutations.accept, {
    userId,
    invitationId: asId<"invitations">(invitationId),
  });
}

/**
 * Revokes a pending invitation.
 */
export async function revokeInvitation(ownerEmail: string, invitationId: string): Promise<Invitation> {
  const userId = await requireUserId(ownerEmail);
  const client = createConvexClient();

  return client.mutation(api.invitations.mutations.revoke, {
    userId,
    invitationId: asId<"invitations">(invitationId),
  });
}
