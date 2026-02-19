import "server-only";
import { api } from "@convex/_generated/api";
import type { Entity, EntityAddress, EntityType, Membership } from "@/lib/domain/types";
import { asId, createConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

interface EntityInput {
  type: EntityType;
  name: string;
  address: EntityAddress;
  currency: string;
  description?: string;
}

interface UpdateEntityInput {
  name: string;
  address: EntityAddress;
  currency: string;
  description?: string;
}

async function requireUserId(userEmail: string) {
  const user = await ensureUser(userEmail);
  return asId<"users">(user.id);
}

/**
 * Lists entities visible to the requesting user.
 */
export async function listEntitiesForUser(
  userEmail: string,
): Promise<Array<{ entity: Entity; membership: Membership }>> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();
  return client.query(api.entities.queries.listForUser, { userId });
}

/**
 * Enforces entity membership for reads and writes.
 */
export async function requireMembership(userEmail: string, entityId: string): Promise<Membership> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.entities.queries.getMembershipForUser, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Enforces owner role for protected operations.
 */
export async function requireOwner(userEmail: string, entityId: string): Promise<Membership> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.entities.queries.requireOwnerForUser, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Lists entity members visible to an authorized collaborator.
 */
export async function listMembersForEntity(userEmail: string, entityId: string): Promise<Membership[]> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.entities.queries.listMembersForEntity, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Creates a new entity and owner membership.
 */
export async function createEntity(ownerEmail: string, input: EntityInput): Promise<Entity> {
  const userId = await requireUserId(ownerEmail);
  const client = createConvexClient();
  return client.mutation(api.entities.mutations.create, { userId, input });
}

/**
 * Retrieves an entity if visible to the caller.
 */
export async function getEntityForUser(userEmail: string, entityId: string): Promise<Entity> {
  const userId = await requireUserId(userEmail);
  const client = createConvexClient();

  return client.query(api.entities.queries.getForUser, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Updates owner-managed entity profile fields.
 */
export async function updateEntity(
  ownerEmail: string,
  entityId: string,
  input: UpdateEntityInput,
): Promise<Entity> {
  const userId = await requireUserId(ownerEmail);
  const client = createConvexClient();

  return client.mutation(api.entities.mutations.update, {
    userId,
    entityId: asId<"entities">(entityId),
    input,
  });
}
