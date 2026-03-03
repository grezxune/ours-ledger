import "server-only";
import { api } from "@convex/_generated/api";
import { asId, createAuthenticatedConvexClient } from "@/lib/data/convex";
import { ensureUser } from "@/lib/data/users";

export interface EntityInstitution {
  id: string;
  entityId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

async function requireUserId(userEmail: string) {
  const user = await ensureUser(userEmail);
  return asId<"users">(user.id);
}

/**
 * Lists available institutions linked to an entity.
 */
export async function listEntityInstitutions(userEmail: string, entityId: string): Promise<EntityInstitution[]> {
  const userId = await requireUserId(userEmail);
  const client = await createAuthenticatedConvexClient(userEmail);

  return client.query(api.institutions.queries.listByEntity, {
    userId,
    entityId: asId<"entities">(entityId),
  });
}

/**
 * Creates an institution for account selection in an entity.
 */
export async function createEntityInstitution(userEmail: string, entityId: string, name: string): Promise<string> {
  const userId = await requireUserId(userEmail);
  const client = await createAuthenticatedConvexClient(userEmail);

  return client.mutation(api.institutions.mutations.create, {
    userId,
    entityId: asId<"entities">(entityId),
    input: { name },
  });
}
